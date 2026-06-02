"""Mirror johndegraft-app operator memory files into a dedicated Cosmos KB.

Separate from the ASI platform KB (asi.kb_chunks) by design: johndegraft-app
runbooks and memories live in `johndegraft.kb_chunks` so the portfolio site
context never bleeds into ASI agents and vice versa.

Account: cosmos-asi-prod1 (target tenant 4f80e7d4-..., sub f51a19c6-...)
Database: johndegraft   (created if missing)
Container: kb_chunks    (partition key /source, created if missing)

Selection: a memory is johndegraft-app relevant if its content mentions
johndegraft.app, the portfolio repo, or the Cloudflare Pages deploy
surface — explicitly excluding ASI Azure platform memories.

Usage:
    python scripts/kb/sync_memory_to_cosmos.py
    python scripts/kb/sync_memory_to_cosmos.py --dry-run
    python scripts/kb/sync_memory_to_cosmos.py --memory-dir /path/to/memory

Idempotent: upserts by `id = "memory::<filename_without_ext>"`.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s :: %(message)s")
log = logging.getLogger(__name__)

DEFAULT_MEMORY_DIR = Path(os.environ.get("MEMORY_DIR", Path.home() / ".memory"))

# Inclusion keywords — a memory must match at least one.
INCLUDE_KEYWORDS = [
    "johndegraft.app",
    "johndegraft-app",
    "portfolio site",
    "portfolio_site",
    "cloudflare pages",
    "pages.dev",
    "cinematic-web-builder",
]

# Exclusion keywords — any match disqualifies (keeps ASI platform memories out).
EXCLUDE_KEYWORDS = [
    "asi_azure",
    "stasiprod",
    "kb_chunks",  # only the ASI sync uses this term in its own memory
    "caj-",
    "fl e1",
    "stockhub.work",  # different domain, lives in ASI KB
    "schwab",
    "topstepbot",
]


def is_johndegraft_relevant(text: str, filename: str) -> bool:
    blob = (text + " " + filename).lower()
    if not any(kw in blob for kw in INCLUDE_KEYWORDS):
        return False
    # But allow if filename itself names johndegraft — that's a strong signal
    # that overrides the broader excludes (e.g. the revert memory mentions
    # cosmos+caj in passing while being squarely about the portfolio site).
    if "johndegraft" in filename.lower():
        return True
    return not any(kw in blob for kw in EXCLUDE_KEYWORDS)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    fm_text = text[3:end].strip()
    body = text[end + 4 :].lstrip()
    meta: dict = {}
    for line in fm_text.splitlines():
        if ":" in line and not line.lstrip().startswith("#"):
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
    return meta, body


def collect(memory_dir: Path) -> list[dict]:
    docs: list[dict] = []
    for path in sorted(memory_dir.glob("*.md")):
        if path.name == "MEMORY.md":
            continue
        # User-profile memories are global and don't belong in a project KB.
        if path.name.startswith("user_"):
            continue
        text = path.read_text()
        if not is_johndegraft_relevant(text, path.name):
            continue
        meta, _body = parse_frontmatter(text)
        docs.append({
            "id": f"memory::{path.stem}",
            "source": f"memory/{path.name}",
            "chunk": 0,
            "text": text,
            "title": meta.get("name", path.stem),
            "description": meta.get("description", ""),
            "memory_type": meta.get("type", ""),
            "synced_at": datetime.now(timezone.utc).isoformat(),
            "project": "johndegraft-app",
        })
    return docs


def upsert(docs: list[dict]) -> int:
    from azure.cosmos import CosmosClient
    from azure.identity import DefaultAzureCredential

    # Database + container are created via az CLI control plane; AAD data
    # plane tokens cannot POST /dbs. Provision once with:
    #   az cosmosdb sql database create -a cosmos-asi-prod1 -g rg-asi-prod1-eus2 -n johndegraft
    #   az cosmosdb sql container create -a cosmos-asi-prod1 -g rg-asi-prod1-eus2 \
    #       -d johndegraft -n kb_chunks -p /source
    account = os.environ.get("COSMOS_ACCOUNT", "cosmos-asi-prod1")
    db_name = os.environ.get("COSMOS_DB", "johndegraft")
    container_name = os.environ.get("COSMOS_CONTAINER", "kb_chunks")

    client = CosmosClient(
        url=f"https://{account}.documents.azure.com:443/",
        credential=DefaultAzureCredential(),
    )
    container = client.get_database_client(db_name).get_container_client(container_name)

    n = 0
    for d in docs:
        container.upsert_item(d)
        n += 1
        log.info("upsert %s (source=%s, %d chars)", d["id"], d["source"], len(d["text"]))
    return n


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--memory-dir", default=str(DEFAULT_MEMORY_DIR))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    memory_dir = Path(args.memory_dir)
    if not memory_dir.exists():
        log.error("memory dir not found: %s", memory_dir)
        return 1

    docs = collect(memory_dir)
    log.info("selected %d johndegraft-app memories", len(docs))
    for d in docs:
        log.info("  %s  ::  %s", d["id"], d["description"][:80])
    if args.dry_run:
        return 0
    if not docs:
        log.warning("nothing to upsert")
        return 0
    n = upsert(docs)
    log.info("synced %d docs to %s.%s",
             n,
             os.environ.get("COSMOS_DB", "johndegraft"),
             os.environ.get("COSMOS_CONTAINER", "kb_chunks"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
