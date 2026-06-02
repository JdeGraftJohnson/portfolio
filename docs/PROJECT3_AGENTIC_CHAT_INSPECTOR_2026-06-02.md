# Project 3 Plan — Agentic Chat + Tool-Call Inspector

**Date:** 2026-06-02
**Owner:** John de Graft-Johnson
**Sibling docs:**
- `clinical-rag-eval/docs/EXPANSION_PLAN_2026-06-02.md` (Project 2)
- `clinical-rag-eval/docs/PHYSIONET_DATASET_PLAN_2026-06-02.md` (Project 2 data)
**Driver:** Close the gap on ~10 frontend-AI / FDE roles in the 2026-06-01 career-ops batch that specifically demand React/Next.js + MCP + streaming tool calls (Cotiviti Lead Frontend AI, Iovance AI Product, Vapi MTS-FDE, Cohere FDE Agentic Platform, OneStream FDE, Distyl AI, Vanta GTM, Tealium AI Dev Tools, Andiamo GenAI, Field Engineer @ Replit).
**Target effort:** 2–3 focused days. Greenfield project at `~/Git/agentic-chat-inspector` with one-click deploy to Vercel.

---

## Goals

Ship a public Next.js demo that, in 60 seconds of recruiter time, proves John can:

1. Build a production streaming chat UI (Vercel AI SDK + SSE + tool-call deltas).
2. Author and wire **multiple MCP servers** (one read-only data, one tool-action) and visualize the tool-call lifecycle.
3. Surface **evals on the conversation** — every chat turn is scored by the same judge framework from `clinical-rag-eval`, and the scorecard renders inline.
4. Cross-link the three portfolio pieces (this project ↔ clinical-rag-eval ↔ ASI_Azure) into one cohesive system, not three silos.

**Non-goals:** auth, billing, multi-tenant orgs, persistent chat history, mobile-native — this is a demo, not a SaaS.

---

## Tech stack (driven by JD keyword density)

| Layer | Choice | JD mentions | Rationale |
|---|---|---|---|
| Framework | Next.js 15 App Router | 67 | Default; Server Components for tool inspector, Server Actions for MCP routing |
| UI primitives | shadcn/ui + Radix + Tailwind | high (shadcn standard) | Recruiter-recognizable, fast to ship |
| Streaming | Vercel AI SDK 4.x | 30 (Vercel) | Native streaming + tool-call helpers; SSE under the hood |
| Foundation models | Claude Sonnet 4.6 (primary), GPT-4o (fallback), Llama 3.3 70B via Together (third leg) | 63 / 42 / 33 | Multi-provider toggle in UI proves portability |
| Tool protocol | **Model Context Protocol (MCP)** — `@modelcontextprotocol/sdk` | 9 explicit + 500+ raw | THE differentiator; build 2 MCP servers |
| Eval backend | LangSmith + reuse `clinical-rag-eval` judges | 149 / 66 | Cross-link to Project 2 — single eval framework powering both |
| Deploy | Vercel (Hobby tier) | 30 | One-command deploy, public URL |
| Observability | OpenTelemetry → LangSmith | — | Traces visible to recruiters via shared link |
| Optional | Cloudflare Workers durable object for shared chat state | low | Only if multi-user demo is wanted; skip for v1 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 15 App Router                                       │
│  ┌──────────────────┐   ┌──────────────────────────────────┐│
│  │  /chat (Client)  │   │  /api/chat (Route Handler)        ││
│  │  - streaming UI  │◀──┤  - Vercel AI SDK streamText       ││
│  │  - tool drawer   │   │  - MCP client init (2 servers)    ││
│  │  - eval badge    │   │  - LangSmith trace decorator      ││
│  └──────────────────┘   └────────────┬─────────────────────┘│
│                                       │                      │
│  ┌──────────────────┐   ┌─────────────▼────────────────────┐│
│  │  /inspector      │   │  /api/eval (Route Handler)        ││
│  │  - trace timeline│   │  - calls clinical-rag-eval judges ││
│  │  - tool I/O JSON │   │  - returns per-turn scorecard     ││
│  │  - eval drawer   │   └────────────┬─────────────────────┘│
│  └──────────────────┘                │                      │
└──────────────────────────────────────┼──────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                ▼                                              ▼
   ┌──────────────────────────┐               ┌──────────────────────────┐
   │ MCP Server #1            │               │ MCP Server #2            │
   │ "asi-readonly"           │               │ "draft-actions"          │
   │ - Cosmos read tools      │               │ - file.write             │
   │ - feed/today,model,news  │               │ - email.draft (mock SES) │
   │ - kb_chunks search       │               │ - calendar.draft         │
   │ Read-only; safe to demo  │               │ All writes are simulated │
   └──────────────────────────┘               └──────────────────────────┘
```

**Why two MCP servers:** recruiters want to see **both read and write tool surfaces** — read-only proves grounding/RAG, write-action proves orchestration. Splitting them across two servers proves you understand MCP composition, not just basic tool calling.

---

## Module 1 — Streaming chat surface (Day 1)

**Scope:**

- `app/chat/page.tsx` — client component, message list + composer.
- `app/api/chat/route.ts` — Route Handler using `streamText` from Vercel AI SDK; emits text deltas + tool-call deltas + tool-result deltas in one SSE stream.
- Multi-provider toggle: dropdown to switch between Claude Sonnet 4.6 / GPT-4o / Llama 3.3 70B at request time. Provider abstraction via Vercel AI SDK's provider interface.
- Token-level streaming with visible typing indicator; tool calls render as collapsed cards inline.

**Deliverables:**

- Working `/chat` route with 3 providers, streaming, tool-call rendering.
- `lib/providers.ts` with the 3 model bindings.
- Lighthouse score ≥90 on `/chat`.

**Acceptance:**

- Type a question, see token streaming begin within 600ms.
- Trigger a tool call, see it expand inline with provider/args/result.
- Switch provider mid-session, next turn uses the new model.

---

## Module 2 — Two MCP servers (Day 1 PM → Day 2 AM)

**Scope:**

- `mcp-servers/asi-readonly/` — Node MCP server exposing 4 tools:
  - `feed.today({ ticker })` → calls live `chat.johndegraft.app/api/feed/today` (or stub during dev)
  - `feed.model({ ticker, sort_by })` → live `/api/feed/model` (compliant variant)
  - `news.search({ query, days })` → live `/api/feed/news`
  - `kb.search({ query, k })` → vector search over a small public corpus (NICE guidelines snapshot + this repo's README)
- `mcp-servers/draft-actions/` — Node MCP server exposing 3 simulated tools:
  - `email.draft({ to, subject, body })` → writes to `/tmp/draft-{uuid}.md` and returns the path
  - `file.write({ path, contents })` → sandboxed to `/tmp/sandbox/`
  - `calendar.draft({ title, when, attendees })` → returns an ICS string
- Both servers run as long-lived stdio or HTTP MCP processes, registered in `app/api/chat/route.ts` via `@modelcontextprotocol/sdk` client.
- **Critical UI piece:** an "MCP Servers" panel in `/inspector` shows handshake status, tool registry from each server, and last-call latency.

**Deliverables:**

- 2 MCP servers under `mcp-servers/`, each with a `package.json` + tool schema definitions.
- `app/inspector/page.tsx` — three-pane view:
  - Pane 1: linear conversation trace (turns + tool calls collapsed)
  - Pane 2: selected-call detail (request JSON, response JSON, latency, model)
  - Pane 3: eval scorecard for the current turn (from Module 3)
- `docs/MCP_SERVERS.md` explaining the architecture for recruiters who land on the repo.

**Acceptance:**

- Tool calls flow through MCP, not hardcoded function bindings.
- Inspector renders every tool I/O with collapsible JSON.
- Stopping one MCP server gracefully degrades — UI shows "server offline," other tools still work.

---

## Module 3 — Eval integration with clinical-rag-eval (Day 2 PM)

**Scope:**

- Reuse `clinical_rag_eval.judges` (the same package from Project 2) — pull in via PyPI publish or `pip install git+...`.
- `services/eval/` — a tiny Python FastAPI service (containerized, deployed to Fly.io or Azure Container Apps) that exposes `POST /score` accepting `{conversation, tool_calls, model}` and returning per-dimension scores (faithfulness, citation-anchoring, hallucination, tool-use correctness).
- `app/api/eval/route.ts` — Next.js Route Handler that fans out to the FastAPI service after each completed turn (non-blocking; UI shows "scoring..." then updates).
- Inline scorecard rendered in `/inspector` pane 3; click any past turn to re-evaluate.
- LangSmith integration: every conversation gets a public shareable trace URL. README links to a live example trace.

**Deliverables:**

- `services/eval/` FastAPI app + Dockerfile.
- `app/api/eval/route.ts` + scorecard React component.
- 1 published LangSmith trace embedded in README.

**Acceptance:**

- Every chat turn shows a scorecard within 4s of completion.
- The same judge code is **imported** from `clinical-rag-eval` — proves the two projects are one platform.
- Failing eval (e.g., hallucinated tool argument) is visibly flagged red in the inspector.

---

## Module 4 — Portfolio cross-linking + recruiter polish (Day 3)

**Scope:**

- Landing page at `/` with three project tiles: **clinical-rag-eval**, **ASI_Azure**, **agentic-chat-inspector**. Each tile links to its repo + a one-paragraph what-it-proves blurb.
- "Try it" button on the chat tile → loads a curated demo conversation (no signup) that exercises both MCP servers and triggers one bad-tool-call so the eval drawer shows a red flag.
- README badges: Vercel deploy, LangSmith traces, MCP-compatible, multi-provider.
- 90-second screen recording embedded — recruiter sees the full loop without cloning.
- cv.md update: new project entry between L82 and L88 ("Agentic Chat + Tool-Call Inspector · Next.js 15 · MCP · Vercel AI SDK · LangSmith evals — public demo of multi-provider agentic chat with two MCP servers and an integrated eval framework reused from the clinical RAG project").

**Deliverables:**

- Live URL: `https://agentic-chat-inspector.vercel.app` (or `inspector.johndegraft.app` via CNAME).
- 90s Loom / screen recording.
- README with architecture diagram + 3 sample traces.
- cv.md + johndegraft.app project card updated.

**Acceptance:**

- Recruiter clicks the live URL, sees streaming chat with tool calls and eval scorecard in <30s.
- Reads README, sees connection to clinical-rag-eval + ASI_Azure.
- Vercel deploy button + LangSmith trace links both work without sign-in.

---

## Sequencing

| Day | AM | PM |
|---|---|---|
| Day 1 | Scaffold Next.js + shadcn + Vercel AI SDK + chat UI | Provider toggle + streaming tool-call rendering |
| Day 2 | MCP server #1 (asi-readonly) + inspector pane 1+2 | MCP server #2 (draft-actions) + handshake panel |
| Day 3 | Eval service (FastAPI) + scorecard pane | Landing page + recording + cv/portfolio updates |

---

## Risk register

| Risk | Mitigation |
|---|---|
| Vercel AI SDK MCP integration immature | Fall back to function-tool primitives, wrap MCP calls in adapter layer; UI stays the same |
| Eval service cold-start latency on Fly.io | Use Azure Container Apps min-replicas=1 (cheap), or inline the judge logic in a Next.js Route Handler for v1 |
| LangSmith free tier rate limits | Use a sampled trace strategy — 1 in every 5 turns gets a full trace, rest get local scoring only |
| MCP server crashes mid-demo | Health checks + UI degradation handled in Module 2 acceptance criteria |
| `clinical-rag-eval` judges not yet published as a package | Pin to a git ref; publish to PyPI as part of this project's deliverables (zero extra work since the code exists) |

---

## Out of scope (deliberately)

- User auth (NextAuth) — adds friction, no recruiter ROI.
- Stripe / paywall — wrong signal for portfolio.
- Vector store of John's full CV — separate "ask my CV" demo, different project.
- Mobile-native — asi-ios already proves SwiftUI.
- LLM fine-tuning — Project 2 handles that.
- Realtime collab / multi-user — interesting but doubles scope.

---

## What this project proves to the 10 frontend-AI roles

- **Cotiviti Lead Frontend AI** — React + streaming UI + AI integration shown end-to-end.
- **Iovance AI Product Engineer** — product-grade chat with eval drawer (clinical relevance via clinical-rag-eval cross-link).
- **Vapi MTS-FDE** — voice-style turn-taking + tool calls; agentic platform proof.
- **Cohere FDE Agentic Platform** — multi-MCP-server orchestration is exactly North-platform shaped.
- **OneStream / Distyl FDE** — enterprise-style tool calling with audit-able traces.
- **Vanta GTM AI** — AI-augmented internal tools demo via the draft-actions server.
- **Tealium AI Dev Tools** — the inspector itself is an AI dev tool.
- **Andiamo GenAI** — multi-provider model toggle proves portability.
- **Field Engineer @ Replit** — agentic coding adjacent; demo is itself shipped in a Replit-style fast-deploy stack.

---

## Action items

- [ ] Init `~/Git/agentic-chat-inspector` with Next.js 15 + Tailwind + shadcn + TypeScript
- [ ] Add Vercel AI SDK + provider bindings (Anthropic, OpenAI, Together)
- [ ] Scaffold `/chat` + `/inspector` + `/api/chat`
- [ ] Build `mcp-servers/asi-readonly`
- [ ] Build `mcp-servers/draft-actions`
- [ ] Stand up FastAPI eval service (reuse `clinical-rag-eval` judges)
- [ ] Wire LangSmith trace publishing
- [ ] Deploy to Vercel, point `inspector.johndegraft.app` CNAME
- [ ] Record 90s demo
- [ ] Update cv.md L82–88 and johndegraft.app landing tiles
- [ ] Cross-link from `clinical-rag-eval` README ("powers the eval drawer in agentic-chat-inspector")
