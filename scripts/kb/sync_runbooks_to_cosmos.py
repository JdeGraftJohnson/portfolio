"""Mirror johndegraft-app runbooks into Cosmos johndegraft.runbooks.

Sibling of sync_memory_to_cosmos.py — that one syncs project memories,
this one syncs project runbooks (the authoritative how-to-operate docs).
Both target the same Cosmos account but different containers so on-the-
ground agents can pull just runbooks or just memories without filtering.

Account: cosmos-asi-prod1 (target tenant 4f80e7d4-..., sub f51a19c6-...)
Database: johndegraft
Container: runbooks (partition key /source, provisioned via az CLI)

Usage:
    python scripts/kb/sync_runbooks_to_cosmos.py
    python scripts/kb/sync_runbooks_to_cosmos.py --dry-run
    python scripts/kb/sync_runbooks_to_cosmos.py --runbooks-dir docs/runbooks
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

DEFAULT_RUNBOOKS_DIR = Path(__file__).resolve().parents[2] / "docs" / "runbooks"


def collect(runbooks_dir: Path) -> list[dict]:
    docs: list[dict] = []
    for path in sorted(runbooks_dir.glob("*.md")):
        text = path.read_text()
        first_h1 = next(
            (line[2:].strip() for line in text.splitlines() if line.startswith("# ")),
            path.stem,
        )
        docs.append({
            "id": f"runbook::{path.stem}",
            "source": f"runbook/{path.name}",
            "chunk": 0,
            "text": text,
            "title": first_h1,
            "synced_at": datetime.now(timezone.utc).isoformat(),
            "project": "johndegraft-app",
        })
    return docs


def upsert(docs: list[dict]) -> int:
    from azure.cosmos import CosmosClient
    from azure.identity import DefaultAzureCredential

    # Database + container are created via az CLI control plane; AAD data
    # plane tokens cannot POST /dbs. Provision once with:
    #   az cosmosdb sql container create -a cosmos-asi-prod1 \
    #       -g rg-asi-prod1-eus2 -d johndegraft -n runbooks -p /source
    account = os.environ.get("COSMOS_ACCOUNT", "cosmos-asi-prod1")
    db_name = os.environ.get("COSMOS_DB", "johndegraft")
    container_name = os.environ.get("COSMOS_CONTAINER", "runbooks")

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
    ap.add_argument("--runbooks-dir", default=str(DEFAULT_RUNBOOKS_DIR))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    runbooks_dir = Path(args.runbooks_dir)
    if not runbooks_dir.exists():
        log.error("runbooks dir not found: %s", runbooks_dir)
        return 1

    docs = collect(runbooks_dir)
    log.info("selected %d runbooks", len(docs))
    for d in docs:
        log.info("  %s  ::  %s", d["id"], d["title"])
    if args.dry_run:
        return 0
    if not docs:
        log.warning("nothing to upsert")
        return 0
    n = upsert(docs)
    log.info("synced %d docs to %s.%s",
             n,
             os.environ.get("COSMOS_DB", "johndegraft"),
             os.environ.get("COSMOS_CONTAINER", "runbooks"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
