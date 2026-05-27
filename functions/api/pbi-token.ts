interface Env {
  PBI_TENANT_ID: string;
  PBI_CLIENT_ID: string;
  PBI_CLIENT_SECRET: string;
  PBI_WORKSPACE_ID: string;
  PBI_REPORT_ID: string;
}

const PBI_SCOPE = "https://analysis.windows.net/powerbi/api/.default";

interface AadTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface EmbedTokenResponse {
  token: string;
  tokenId: string;
  expiration: string;
}

interface ReportMetadata {
  id: string;
  embedUrl: string;
  datasetId: string;
}

interface GenerateTokenBody {
  accessLevel: "View";
  datasets: { id: string }[];
  identities?: {
    username: string;
    roles: string[];
    datasets: string[];
  }[];
}

async function mintAadToken(env: Env): Promise<string> {
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.PBI_CLIENT_ID,
    client_secret: env.PBI_CLIENT_SECRET,
    scope: PBI_SCOPE,
  });
  const res = await fetch(
    `https://login.microsoftonline.com/${env.PBI_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );
  const body = (await res.json()) as AadTokenResponse;
  if (!res.ok || !body.access_token) {
    throw new Error(
      `AAD token failed: ${body.error ?? res.status} ${body.error_description ?? ""}`
    );
  }
  return body.access_token;
}

async function getReportMetadata(
  aadToken: string,
  workspaceId: string,
  reportId: string
): Promise<ReportMetadata> {
  const res = await fetch(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
    { headers: { Authorization: `Bearer ${aadToken}` } }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Report metadata fetch failed: ${res.status} ${text}`);
  }
  return (await res.json()) as ReportMetadata;
}

async function generateEmbedToken(
  aadToken: string,
  workspaceId: string,
  reportId: string,
  datasetId: string
): Promise<EmbedTokenResponse> {
  // RLS identity was previously hardcoded as { username: "portfolio-viewer",
  // roles: ["state_code"] }. That identity matched no rows in the dataset's
  // state_code RLS role, so every visual returned empty and the report hung
  // on "Loading data...". The portfolio embed is intentionally public, so
  // we mint a no-identity token — the dataset must either remove its RLS
  // role or expose a public row-set for this to render. See runbook
  // docs/runbooks/project-button-audit.md for the diagnostic chain.
  const body: GenerateTokenBody = {
    accessLevel: "View",
    datasets: [{ id: datasetId }],
  };
  const res = await fetch(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aadToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GenerateToken failed: ${res.status} ${text}`);
  }
  return (await res.json()) as EmbedTokenResponse;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const aad = await mintAadToken(env);
    const meta = await getReportMetadata(
      aad,
      env.PBI_WORKSPACE_ID,
      env.PBI_REPORT_ID
    );
    const embed = await generateEmbedToken(
      aad,
      env.PBI_WORKSPACE_ID,
      env.PBI_REPORT_ID,
      meta.datasetId
    );
    return new Response(
      JSON.stringify({
        reportId: meta.id,
        embedUrl: meta.embedUrl,
        token: embed.token,
        expiration: embed.expiration,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
