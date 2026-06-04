// Cloudflare Pages Function: server-side proxy for the propfirmbot Solana
// devnet anchor feed. The wallet pubkey is held only in this Worker's env
// (PROPFIRMBOT_SOLANA_PUBKEY) and NEVER returned to the browser. The browser
// receives only decoded memo content + tx signatures, so the pubkey never
// appears in DevTools Network / Console / Sources.

interface Env {
  PROPFIRMBOT_SOLANA_PUBKEY: string;
  // Optional override. Default = official Solana devnet. Swap to a
  // paid endpoint (Helius/QuickNode/Triton) if the default's
  // rate-limit / IP-blocklist starts biting in production.
  PROPFIRMBOT_SOLANA_RPC_URL?: string;
}

// Tried in order until one returns. The official endpoint frequently
// blocks Cloudflare's edge IP range; community endpoints fill the gap.
const DEFAULT_DEVNET_RPCS = [
  "https://api.devnet.solana.com",
  "https://solana-devnet.public.blastapi.io",
  "https://devnet.helius-rpc.com",
];
const RPC_TIMEOUT_MS = 6_000;
const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

const ALLOWED_ORIGINS = new Set<string>([
  "https://johndegraft.app",
  "https://www.johndegraft.app",
  "https://johndegraft-app.pages.dev",
  "http://localhost:3000",
  "http://localhost:3001",
]);

interface RpcResp<T> { result?: T; error?: { code: number; message: string } }

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), RPC_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    const json = (await res.json()) as RpcResp<T>;
    if (json.error) throw new Error(`${method}: ${JSON.stringify(json.error)}`);
    return json.result as T;
  } finally {
    clearTimeout(timer);
  }
}

async function rpcWithFallback<T>(
  urls: string[], method: string, params: unknown[],
): Promise<{ result: T; url: string }> {
  let lastErr: unknown = null;
  for (const url of urls) {
    try {
      const result = await rpc<T>(url, method, params);
      return { result, url };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`all RPCs failed; last=${String(lastErr)}`);
}

// `getSignaturesForAddress` returns each record with a `memo` field formatted
// as "<len> <text>" (length-prefixed UTF-8). We parse the JSON memo directly
// from there -- no per-tx getTransaction calls needed (saves 30 RPC requests
// per page load and stays well under Workers CPU / subrequest budgets).
function parseInlineMemo(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  // Strip optional "[length] " prefix; some RPCs return just the text.
  const text = raw.replace(/^\[\d+\]\s*/, "").trim();
  try {
    const m = JSON.parse(text);
    if (m && typeof m.v === "string" && m.v.startsWith("tsb.")) return m;
  } catch {/* not our memo */}
  return null;
}

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://johndegraft.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=30",
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get("Origin");
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const pubkey = context.env.PROPFIRMBOT_SOLANA_PUBKEY;
  if (!pubkey) {
    return new Response(
      JSON.stringify({ error: "publisher not configured" }),
      { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } },
    );
  }

  const rpcUrls = context.env.PROPFIRMBOT_SOLANA_RPC_URL
    ? [context.env.PROPFIRMBOT_SOLANA_RPC_URL, ...DEFAULT_DEVNET_RPCS]
    : DEFAULT_DEVNET_RPCS;
  try {
    const { result: sigs } = await rpcWithFallback<
      Array<{ signature: string; blockTime: number | null; memo: string | null }>
    >(rpcUrls, "getSignaturesForAddress", [pubkey, { limit: 30 }]);
    const rows: Array<{ sig: string; blockTime: number | null; memo: Record<string, unknown> }> = [];
    for (const s of sigs) {
      const memo = parseInlineMemo(s.memo);
      if (memo) rows.push({ sig: s.signature, blockTime: s.blockTime, memo });
    }
    return new Response(
      JSON.stringify({ rows }),
      { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? String(e) }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } },
    );
  }
};
