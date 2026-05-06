export async function onRequest(context: EventContext<unknown, string, unknown>) {
  const url = new URL(context.request.url);
  url.hostname = "ai-proposal-intelligence.vercel.app";
  url.port = "";
  url.protocol = "https:";

  const headers = new Headers(context.request.headers);
  headers.set("host", "ai-proposal-intelligence.vercel.app");
  headers.delete("x-forwarded-host");

  const response = await fetch(url.toString(), {
    method: context.request.method,
    headers,
    body:
      context.request.method !== "GET" && context.request.method !== "HEAD"
        ? context.request.body
        : undefined,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
