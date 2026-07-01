# PyCoach

PyCoach is a deployable MVP for practicing Python in the browser. Students work through five focused exercises, submit code for immediate grading and feedback, see a mastery estimate per skill, and receive a recommendation for the skill with the lowest estimated mastery. Instructors get a compact stream of student submissions and grades.

## What is included

- Real Supabase-authenticated student and instructor demo accounts
- Five assignments: variables, conditionals, loops, lists, and functions
- Monaco-based Python editor with loading, error, and feedback states
- Five documented route handlers under `/api`
- PostgreSQL schema, seed data, foreign keys, checks, and row-level security policies
- Bayesian Knowledge Tracing (BKT) proof of concept and mastery-based recommendations
- Unit tests for BKT and grader safety behavior
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

## Architecture

The application is a single Next.js App Router repository. React pages and components call Next.js route handlers; the route handlers own grading and mastery updates; Supabase PostgreSQL stores users, assignments, submissions, grades, and mastery.

```text
Browser (Next.js + Monaco)
          │
          ▼
Next.js Route Handlers ─────► Isolated Python runner
          │                    (CODE_RUNNER_URL)
          ▼
Supabase Auth + PostgreSQL
```

The deployed assessment is connected to a hosted Supabase project. For a fresh environment, run the migrations in [`supabase/migrations`](supabase/migrations), apply [`supabase/seed.sql`](supabase/seed.sql), then provide the values in [`.env.example`](.env.example). The schema includes role-aware row-level security: students can submit and read their own records; instructors can monitor the class. A signup trigger creates each profile and the five initial mastery rows.

## Auto-grading approach

`POST /api/grade` validates the request and rejects oversized submissions plus common filesystem, process, network, and dynamic-execution APIs. When `CODE_RUNNER_URL` is configured, it sends the code and hidden tests to that isolated runner with an eight-second request timeout.

Without a runner, Vercel uses a clearly labelled structural fallback. It checks whether the submission contains the core constructs required by the exercise and returns immediate formative feedback. This mode is intentionally conservative and is **demo-only**: it does not execute Python, cannot prove semantic correctness, and can be fooled by equivalent or adversarial source text.

Running arbitrary student code in the Next.js/Vercel process would be unsafe. A production deployment should use short-lived, network-disabled containers or microVMs with CPU, memory, wall-clock, process, and output limits—for example E2B or a Firecracker-backed runner. The worker should receive only submission code and tests, discard the environment after execution, and return normalized test results. Grading should be rate-limited, audited, and separated from the application database credentials.

## Knowledge tracing and personalization

Each assignment maps to one knowledge component. For each student-skill pair, BKT maintains `P(L)`, the probability that the skill is mastered. After an observed correct or incorrect submission, Bayes' rule updates the probability using slip and guess, then applies a learning transition. This implementation uses the approved proof-of-concept parameters:

- initial mastery `P(L₀) = 0.30`
- learning transition `P(T) = 0.12`
- guess `P(G) = 0.20`
- slip `P(S) = 0.10`

The recommendation endpoint selects an unfinished assignment mapped to the lowest-mastery skill and explains the reason. BKT is a good MVP choice because it is interpretable, works from short interaction sequences, and does not pretend that this small system has enough data to train a deep model.

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

Import this repository into Vercel, set the Supabase variables and optional `CODE_RUNNER_URL`, then deploy. Vercel can run the app and fallback grader as-is. A semantic Python grader requires the external isolated runner described above.

## Current MVP limitations

- The assessment exposes two fixed demo accounts; production would add invitation, password reset, and account-management flows.
- The fallback grader is structural, not semantic.
- BKT parameters are expert defaults, not fitted to platform data.
- One skill is mapped to each assignment; production content may require multi-skill tagging and prerequisite constraints.
