# PyCoach

PyCoach is a deployable MVP for practicing Python in the browser. Students work through five focused exercises, submit code for immediate grading and feedback, see a mastery estimate per skill, and receive a recommendation for the skill with the lowest estimated mastery. Instructors get a compact stream of student submissions and grades.

## What is included

- Real Supabase-authenticated student and instructor demo accounts
- Self-service student signup with automatic profile and initial mastery creation
- Five assignments: variables, conditionals, loops, lists, and functions
- Monaco-based Python editor with loading, error, and feedback states
- Five documented route handlers under `/api`
- PostgreSQL schema, seed data, foreign keys, checks, and row-level security policies
- Bayesian Knowledge Tracing (BKT) proof of concept and mastery-based recommendations
- Unit tests for BKT, Groq response validation, and grader safety behavior
- Responsive UI verified at desktop and 390px mobile width

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and use `/login` to choose the seeded student or instructor account. Both buttons authenticate against Supabase; submissions and mastery changes persist in PostgreSQL.

To verify the project:

```bash
pnpm test
pnpm build
```

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser-safe Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only persistence key; never expose to the browser |
| `GROQ_API_KEY` | Yes | Server-only credential for LLM grading |
| `GROQ_MODEL` | No | Groq model override; defaults to `llama-3.1-8b-instant` |

## Architecture

The application is a single Next.js App Router repository. React pages and components call Next.js route handlers; the route handlers own grading and mastery updates; Supabase PostgreSQL stores users, assignments, submissions, grades, and mastery.

```text
Browser (Next.js + Monaco)
          │
          ▼
Next.js Route Handlers ─────► Groq LLM grading
          │
          ▼
Supabase Auth + PostgreSQL
```

The deployed assessment is connected to a hosted Supabase project. For a fresh environment, run the migrations in [`supabase/migrations`](supabase/migrations), apply [`supabase/seed.sql`](supabase/seed.sql), then provide the values in [`.env.example`](.env.example). The schema includes role-aware row-level security: students can submit and read their own records; instructors can monitor the class. A signup trigger creates each profile and the five initial mastery rows. Public signups are always assigned the student role; instructor access must be granted administratively.

## Auto-grading approach

`POST /api/grade` validates the request and rejects empty, oversized, and obviously dangerous submissions before sending the assignment, public and hidden tests, assignment-specific rubric, backend-only reference solution, and student code to Groq. Tests and rubric are the primary grading basis; the reference solution clarifies intended behavior without requiring students to write identical code. The model returns a strict JSON grade, pass/fail decision, feedback, concrete mistakes, a non-revealing hint, and a short reasoning summary. The server validates every field and derives `passed` from `grade >= 80`; invalid model output is rejected and never silently becomes a passing grade.

Reference solutions and hidden tests are readable only through the server-side service-role grading path. They are excluded from student-facing assignment queries and are never sent to the browser.

Groq LLM grading is the MVP's primary and required grader. This follows the assessment's explicit option to use an LLM provider for automated grading and intelligent feedback. If `GROQ_API_KEY` is absent, grading fails clearly instead of falling back to regex checks.

The Vercel application does not execute arbitrary Python. Even with stronger test, rubric, and reference context, LLM grading remains probabilistic and can occasionally misjudge semantics. A production upgrade should be hybrid: execute tests deterministically in short-lived, network-disabled containers or microVMs such as E2B or Firecracker, then use the LLM to explain the verified results and provide personalized guidance.

## Knowledge tracing and personalization

Each assignment maps to one knowledge component. For each student-skill pair, BKT maintains `P(L)`, the probability that the skill is mastered. After an observed correct or incorrect submission, Bayes' rule updates the probability using slip and guess, then applies a learning transition. This implementation uses the approved proof-of-concept parameters:

- initial mastery `P(L₀) = 0.30`
- learning transition `P(T) = 0.12`
- guess `P(G) = 0.20`
- slip `P(S) = 0.10`

The `0.30` initial value is an internal prior, not earned mastery. Until a student submits work for a skill, the dashboard labels it **Not attempted** and hides the percentage so the prior is not misleading. After the first submission, the UI shows the actual BKT estimate.

The recommendation endpoint selects an assignment mapped to the lowest-mastery skill and explains the reason. After grading, the result panel shows the updated mastery and next action immediately: scores below 80 recommend retrying the same assignment, while passing work links to the weakest-skill recommendation. BKT is a good MVP choice because it is interpretable, works from short interaction sequences, and does not pretend that this small system has enough data to train a deep model.

### Data to collect

For every learning opportunity, collect: anonymized student ID; assignment and skill IDs; submitted code; correctness and per-test outcomes; attempt number; timestamps; response time; hint or feedback exposure; resubmission interval; assignment difficulty; and the mastery estimate before and after the attempt. In production, parameters should be fitted and calibrated on held-out sequences, segmented only when there is enough data, and monitored for systematic error across learner groups. Raw code and identifiers need retention controls and should not be used to train models without an explicit policy.

### Research basis

- Corbett, A. T., & Anderson, J. R. (1995). “Knowledge Tracing: Modeling the Acquisition of Procedural Knowledge.” *User Modeling and User-Adapted Interaction, 4*, 253–278. [doi:10.1007/BF01099821](https://doi.org/10.1007/BF01099821)
- Pardos, Z. A., & Heffernan, N. T. (2010). “Modeling Individualization in a Bayesian Networks Implementation of Knowledge Tracing.” *UMAP 2010*, 255–266. [Publication page](https://www.ischool.berkeley.edu/research/publications/2010/modeling-individualization-bayesian-networks-implementation-knowledge)
- Piech, C. et al. (2015). “Deep Knowledge Tracing.” *NeurIPS 2015*. [arXiv:1506.05908](https://arxiv.org/abs/1506.05908)

Corbett and Anderson establish the classic latent mastery model. Pardos and Heffernan show why learner- and skill-specific parameters are a meaningful extension once sufficient data exists. Piech et al. provide the deep sequential alternative; it is deliberately not used here because the assessment timeframe cannot produce the large interaction dataset needed to justify it.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/assignments` | List assignments without hidden tests |
| POST | `/api/grade` | Grade a submission and return updated mastery |
| GET | `/api/mastery` | Return the student's skill probabilities |
| GET | `/api/recommendations` | Return the lowest-mastery next exercise |
| GET | `/api/instructor/submissions` | Return the instructor submission stream |

## Deployment

Import this repository into Vercel, set the Supabase variables and required `GROQ_API_KEY`, then deploy. `GROQ_MODEL` is optional and defaults to `llama-3.1-8b-instant`. Grading intentionally returns HTTP 500 when the required Groq key is not configured.

## Current MVP limitations

- Student self-service signup is available; invitation, password reset, and account-management flows remain future work.
- LLM grading is probabilistic; production should combine deterministic sandbox tests with LLM explanations.
- BKT parameters are expert defaults, not fitted to platform data.
- One skill is mapped to each assignment; production content may require multi-skill tagging and prerequisite constraints.
