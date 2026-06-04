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

const DEFAULT_DEVNET_RPC = "https://api.devnet.solana.com";
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
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = (await res.json()) as RpcResp<T>;
  if (json.error) throw new Error(`${method}: ${JSON.stringify(json.error)}`);
  return json.result as T;
}

function decodeMemoFromTx(tx: any): Record<string, unknown> | null {
  try {
    const instrs: any[] = tx?.transaction?.message?.instructions ?? [];
    for (const ix of instrs) {
      if (ix?.program === "spl-memo" || ix?.programId === MEMO_PROGRAM_ID) {
        const text = typeof ix.parsed === "string" ? ix.parsed : null;
        if (text) {
          const m = JSON.parse(text);
          if (m && typeof m.v === "string" && m.v.startsWith("tsb.")) return m;
        }
      }
    }
  } catch {/* swallow per-tx decode errors */}
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

  const rpcUrl = context.env.PROPFIRMBOT_SOLANA_RPC_URL || DEFAULT_DEVNET_RPC;
  try {
    const sigs = await rpc<Array<{ signature: string; blockTime: number | null }>>(
      rpcUrl,
      "getSignaturesForAddress",
      [pubkey, { limit: 30 }],
    );
    if (!sigs.length) {
      return new Response(
        JSON.stringify({ rows: [] }),
        { headers: { "Content-Type": "application/json", ...corsHeaders(origin) } },
      );
    }
    const txs = await Promise.all(
      sigs.map(s =>
        rpc<any>(rpcUrl, "getTransaction", [
          s.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]).catch(() => null),
      ),
    );
    const rows: Array<{ sig: string; blockTime: number | null; memo: Record<string, unknown> }> = [];
    sigs.forEach((s, i) => {
      const memo = decodeMemoFromTx(txs[i]);
      if (memo) rows.push({ sig: s.signature, blockTime: s.blockTime, memo });
    });
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
