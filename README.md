# Resume Tailor

AI-powered workspace for generating dozens of job applications and tailored resumes in a single sitting. Built with the Next.js 15 App Router, the project combines bulk job intake, document parsing, OpenAI-driven tailoring, live previews, and DOCX export into one workflow that hiring teams or job seekers can run end-to-end.

## Highlights
- **Bulk job intelligence** – paste company URLs or import Excel, then use GPT-4o powered endpoints to fill in job titles, descriptions, and relevant skills in parallel.
- **Resume-aware generation** – upload PDF/DOCX/TXT resumes; the `mammoth`, `pdfjs-dist`, and text fallbacks capture every section and store it in `localStorage` to contextualize downstream prompts.
- **Structured tailoring pipeline** – `/api/generate-tailored-resume` enforces a rich JSON schema (conditional presence flags, contact preservation, enhanced bullet rules) so no fabricated data slips through.
- **Modern preview + export** – `resume-generation` renders side-by-side previews (original vs tailored) with `docx-preview` and produces Canva-inspired DOCX files through `lib/modern-resume-generator.ts`.
- **Async job runner** – `/api/generate-resume/start|status` persists job progress in `.tmp/`, allowing long-running tailoring tasks to be polled and downloaded when ready.
- **Documentation-first** – the `docs/` folder captures every system (conditional fields, DOCX extraction, schema design) with runnable summary scripts for onboarding.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript, running on pnpm
- **Styling/UI**: Tailwind CSS, shadcn/ui primitives (Radix), Lucide icons, custom theming in `lib/resume-themes.ts`
- **AI + Data**: OpenAI GPT-4o / gpt-4o-mini, function calling, streaming docs upload proxied through Edge route `/api/upload-resume`
- **Docs & Export**: `docx`, `docx-preview`, `mammoth`, `pdfjs-dist`, `xlsx`, `marked`, `file-saver`

## Directory Map
```
app/                  Next.js routes (App Router)
  bulk-jobs/          Bulk job generator UI (default landing)
  resume-generation/  Tailored resume dashboard + previews
  api/                OpenAI-backed endpoints (job + resume APIs)
components/           Reusable shadcn/ui components + feature modules
hooks/                Custom hooks (toast, responsive helpers)
lib/                  Resume generators, sample data, utilities, themes
public/               Static assets (sample jobs CSV/XLSX, icons)
styles/               Global Tailwind + DOCX preview styles
docs/                 Deep dives into schema, extraction, integration
tests/manual/         Node scripts to smoke-test API flows
```

## Getting Started
### Prerequisites
- Node.js **18.18+** (or 20+)
- pnpm **9+**
- An OpenAI API key with access to GPT-4o / GPT-4o-mini

### Installation
```bash
pnpm install
cp .env.example .env.local  # create the file if it does not exist yet
```
Populate `.env.local`:
```
OPENAI_API_KEY=sk-...
NEXTAUTH_URL=http://localhost:3000   # optional, used by async resume runner
```

### Development Commands
```bash
pnpm dev       # start Next.js locally on http://localhost:3000
pnpm lint      # Next.js / ESLint checks
pnpm build     # production build (Next.js)
pnpm start     # run the production server after pnpm build
```

## Usage Flow
1. **Upload a base resume** in Bulk Job Generator (supports PDF, DOCX, TXT). The extracted text plus the raw file is stored in `localStorage` for previews.
2. **Enter or import job rows** – add company URLs manually or bulk import via Excel (columns: Company URL, Job Title, Description, Skills). Toggle "Include Descriptions" to control generation scope.
3. **Generate job data** – run per-row or bulk actions that hit `/api/generate-job-title`, `/api/generate-job-description`, and `/api/generate-job-skills`. Target roles are inferred via `/api/generate-target-role` so titles stay consistent.
4. **Kick off resume generation** – once each row has a URL, title, and description, click *Start Resume Generation*. This calls `/api/generate-resume/start`, which in turn streams work to `/api/generate-tailored-resume`.
5. **Review + export** – the `/resume-generation` page polls `/api/generate-resume/status`, renders DOCX previews in-browser, and lets you download modern templates per job.

## API Surface
| Route | Method | Purpose |
| --- | --- | --- |
| `/api/generate-job-title` | POST | GPT-4o-mini powered title inference with company + resume context |
| `/api/generate-job-description` | POST | Writes engaging descriptions keyed to generated titles |
| `/api/generate-job-skills` | POST | Extracts prioritized skill stacks per job |
| `/api/generate-complete-job` | POST | Orchestrates the three endpoints to fill an entire row |
| `/api/generate-bulk-jobs` | POST | Batch wrapper for large spreadsheets / URL lists |
| `/api/generate-target-role` | POST | Infers a canonical target role so titles stay coherent |
| `/api/upload-resume` | POST | Edge runtime bridge to OpenAI file uploads (Assistants-compatible) |
| `/api/generate-tailored-resume` | POST/GET | Function-calling endpoint enforcing conditional schema + tailoring rules |
| `/api/generate-resume/start` | POST | Launches async resume generation and caches task metadata in `.tmp/` |
| `/api/generate-resume/status` | GET | Pollable status + download URLs for generated resumes |

## Document Processing & Tailoring
- `components/bulk-job-generator.tsx` contains the full ingestion pipeline: comprehensive DOCX extraction (`mammoth` + ZIP fallback), PDF parsing with resilient worker fallbacks, Excel mapping with flexible column detection, and local persistence.
- `lib/modern-resume-generator.ts` builds polished Canva-inspired DOCX files, honoring `source_content_analysis` flags so only verified contact details appear.
- `app/api/generate-tailored-resume/route.ts` defines the exhaustive OpenAI function schema. Each section carries `has_*` guards so fabricated data is impossible, and summarization logic enforces bullet rewrites, job-title enhancement, skills reordering, and ATS keyword density.
- Asynchronous tasks store JSON blobs in `.tmp/` (replace with Redis/DB in production). The `resume-generation` page also stores uploaded files in `localStorage` so previews can render the original resume alongside the tailored version.

## Testing & QA
Manual smoke tests live in `tests/manual/` and can be executed with Node once the dev server is running:
```bash
node tests/manual/test-complete-workflow.js
```
Additional scripts cover conditional field validation and end-to-end flows (`test-all-conditional-fields.js`, `test-complete-resume-flow.js`).

## Documentation & References
- `docs/COMPLETE_CONDITIONAL_SYSTEM.md` – how the `has_*` flags drive UI rendering and fabrication prevention.
- `docs/COMPREHENSIVE_DOCX_SOLUTION.md` + companions – deep dive into document extraction strategies.
- `docs/ENHANCED_SCHEMA_COMPLETE.md` & `docs/INTEGRATION_COMPLETE.md` – API schema evolution and integration guidance.
- Summary JS files (e.g., `docs/enhanced-schema-overview.js`) can be run with Node to print high-level notes for onboarding sessions.

## Next Steps
- Swap `.tmp/` persistence for Redis, Dynamo, or Supabase when deploying multi-user workloads.
- Gate expensive OpenAI calls behind rate limiting and request queues if usage spikes.
- Extend `lib/resume-themes.ts` to add alternative templates (classic, minimal, creative) and expose them in `ModernResumePreview`.

With this README and the docs directory, new contributors should be able to set up the project, understand the AI pipeline, and ship improvements confidently.
