# PyCoach

PyCoach is a deployable MVP for practicing Python in the browser. Students work through five focused exercises, submit code for immediate grading and feedback, see a mastery estimate per skill, and receive an evidence-aware recommendation. Instructors get a student-level progress overview with drill-down submission history.

## Demo

- Live app: [https://pycoach.vercel.app](https://pycoach.vercel.app)
- Repository: [https://github.com/FFFames/PyCoach](https://github.com/FFFames/PyCoach)

## Screenshots

- Student log-in

<img width="663" height="879" alt="image" src="https://github.com/user-attachments/assets/dca081bd-137b-4972-92a7-9d9f224e7784" />

- Student sign-up and Demo accounts

<img width="706" height="848" alt="image" src="https://github.com/user-attachments/assets/117ebb8c-6d8a-4d73-b9e6-cbf42a748178" />

- Student dashboard 

<img width="1402" height="905" alt="2569-07-02_00-54-07" src="https://github.com/user-attachments/assets/9ddd9846-69dd-4da3-8068-fc9fa3ce39a6" />

- Assignment 
<img width="1333" height="641" alt="image" src="https://github.com/user-attachments/assets/f6fae681-106c-439f-b925-84a7c052ae8e" />


- Mastery and recommendation (Passed)
  
<img width="1425" height="931" alt="image" src="https://github.com/user-attachments/assets/a6c04763-3890-4f53-baf7-820c577afc6b" />
- Syntax Error
  
<img width="1302" height="703" alt="2569-07-02_01-02-12" src="https://github.com/user-attachments/assets/0f529cd2-b920-40a0-abc7-75892aa55f11" />
- Mastery and recommendation (Failed)
  
<img width="1292" height="934" alt="image" src="https://github.com/user-attachments/assets/4164ae14-d5f0-45b5-bc0e-b1c5ee5ae280" />

- Instructor dashboard

<img width="1312" height="791" alt="image" src="https://github.com/user-attachments/assets/3bf0a590-ca02-4e9d-8be0-e0500686a771" />

- Student detail view

<img width="1297" height="933" alt="image" src="https://github.com/user-attachments/assets/3d237b0e-f5ca-4c2f-b6fa-98e163bba5d2" />



## What is included

- Real Supabase-authenticated demo accounts for student and instructor exploration
- Email/password login for returning users plus self-service student signup with automatic profile and initial mastery creation
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

Open [http://localhost:3000](http://localhost:3000) and use `/login` to sign in with email/password, create a student account, or enter the seeded demo student and instructor accounts. All paths authenticate against Supabase; submissions and mastery changes persist in PostgreSQL.

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

The deployed assessment is connected to a hosted Supabase project. For a fresh environment, run the migrations in [`supabase/migrations`](supabase/migrations), apply [`supabase/seed.sql`](supabase/seed.sql), then provide the values in [`.env.example`](.env.example). The schema includes role-aware row-level security: students can submit and read their own records; instructors can monitor the class. Returning users sign in with Supabase email/password auth, a signup trigger creates each new student profile plus the five initial mastery rows, and the demo buttons log into the seeded Maya student and instructor accounts. Public signups are always assigned the student role; instructor access must be granted administratively.

## Project structure

```text
app/          Next.js App Router pages and API route handlers
components/   Shared UI components
lib/          BKT, grading, recommendation, and Supabase mapping logic
supabase/     Schema, migrations, and seed data
docs/         Assessment documentation and screenshots
```

## Key design decisions

- Next.js App Router keeps the UI, authenticated pages, and server-side grading endpoints in one deployable codebase with straightforward route-level ownership.
- Supabase provides managed Auth, PostgreSQL, and row-level security, which keeps the MVP focused on learning and grading flows instead of custom account infrastructure.
- Groq LLM grading matches the assessment allowance for LLM-based auto-grading and makes it feasible to ship structured feedback within a short MVP timeline.
- BKT is used instead of Deep Knowledge Tracing because this project has a tiny interaction dataset, short learning sequences, and a strong need for interpretable mastery updates.
- LLM-only grading is acceptable for the MVP, but production should combine deterministic sandbox execution with LLM explanations so scoring is verifiable and feedback remains helpful.

## Auto-grading approach

`POST /api/grade` validates the request and rejects empty, oversized, and obviously dangerous submissions before sending the assignment, public and hidden tests, assignment-specific rubric, backend-only reference solution, and student code to Groq. Tests and rubric are the primary grading basis; the reference solution clarifies intended behavior without requiring students to write identical code. The prompt explicitly asks the grader to check every required case, branch, category, and output from the assignment, and to call out incomplete solutions even when syntax or indentation errors are also present. The model returns a strict JSON grade, pass/fail decision, feedback, concrete mistakes, a non-revealing hint, and a short reasoning summary. The server validates every field and derives `passed` from `grade >= 80`; invalid model output is rejected and never silently becomes a passing grade.

Reference solutions and hidden tests are readable only through the server-side service-role grading path. They are excluded from student-facing assignment queries and are never sent to the browser.

Groq LLM grading is the MVP's primary and required grader. This follows the assessment's explicit option to use an LLM provider for automated grading and intelligent feedback. The current prompt also asks the model to report both structural issues, such as syntax or indentation mistakes, and missing required logic when both are present. If `GROQ_API_KEY` is absent, grading fails clearly instead of falling back to regex checks.

The Vercel application does not execute arbitrary Python. Even with stronger test, rubric, and reference context, LLM grading remains probabilistic and can occasionally misjudge semantics. A production upgrade should be hybrid: execute tests deterministically in short-lived, network-disabled containers or microVMs such as E2B or Firecracker, then use the LLM to explain the verified results and provide personalized guidance.

## Knowledge tracing and personalization

Each assignment maps to one knowledge component. For each student-skill pair, BKT maintains `P(L)`, the probability that the skill is mastered. After an observed correct or incorrect submission, Bayes' rule updates the probability using slip and guess, then applies a learning transition. This implementation uses the approved proof-of-concept parameters:

- initial mastery `P(L₀) = 0.30`
- learning transition `P(T) = 0.12`
- guess `P(G) = 0.20`
- slip `P(S) = 0.10`

The `0.30` initial value is an internal prior, not earned mastery. Until a student submits work for a skill, the dashboard labels it **Not attempted** and hides the percentage so the prior is not misleading. After the first submission, the UI shows the actual BKT estimate.

Recommendations use evidence-aware progression. A new student starts with Variables without treating the `0.30` prior as observed mastery. After at least one attempt, the system recommends the next unattempted concept in order—variables, conditionals, loops, lists, functions. Only after every skill has submission evidence does it recommend the lowest BKT mastery. After grading, scores below 80 still recommend retrying the same assignment; passing work follows this progression. BKT is a good MVP choice because it is interpretable, works from short interaction sequences, and does not pretend that this small system has enough data to train a deep model.

## Why Bayesian Knowledge Tracing?

- The current project has a very small dataset, so a lightweight probabilistic model is more credible than a deep sequence model.
- BKT is interpretable: each update can be explained in terms of prior mastery, observed correctness, guess, slip, and learning transition.
- It works well with short interaction sequences, which fits a five-assignment MVP better than methods that expect long histories.
- It is easier to validate and discuss in an interview setting than Deep Knowledge Tracing.
- DKT is a strong research direction, but it generally needs much larger sequential learning datasets to justify training and tuning.

### Data to collect

For every learning opportunity, collect: anonymized student ID; assignment and skill IDs; submitted code; correctness and per-test outcomes; attempt number; timestamps; response time; hint or feedback exposure; resubmission interval; assignment difficulty; and the mastery estimate before and after the attempt. In production, parameters should be fitted and calibrated on held-out sequences, segmented only when there is enough data, and monitored for systematic error across learner groups. Raw code and identifiers need retention controls and should not be used to train models without an explicit policy.

### Research basis

- Corbett, A. T., & Anderson, J. R. (1995). “Knowledge Tracing: Modeling the Acquisition of Procedural Knowledge.” *User Modeling and User-Adapted Interaction, 4*, 253–278. [Open PDF](https://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/893CorbettAnderson1995.pdf)
- Pardos, Z. A., & Heffernan, N. T. (2010). “Modeling Individualization in a Bayesian Networks Implementation of Knowledge Tracing.” *UMAP 2010*, 255–266. [Open PDF](https://web.cs.wpi.edu/~nth/pubs_and_grants/papers/2010/PardosUser%20Modeling2010.pdf)
- Piech, C. et al. (2015). “Deep Knowledge Tracing.” *NeurIPS 2015*. [arXiv:1506.05908](https://arxiv.org/abs/1506.05908)

Corbett and Anderson establish the classic latent mastery model. Pardos and Heffernan show why learner- and skill-specific parameters are a meaningful extension once sufficient data exists. Piech et al. provide the deep sequential alternative; it is deliberately not used here because the assessment timeframe cannot produce the large interaction dataset needed to justify it.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/assignments` | List assignments without hidden tests |
| POST | `/api/grade` | Grade a submission and return updated mastery |
| GET | `/api/mastery` | Return the student's skill probabilities |
| GET | `/api/recommendations` | Return the next recommended assignment using start-here, next-unattempted, or weakest-mastery logic |
| GET | `/api/instructor/students` | Return instructor-only student-level progress summaries |
| GET | `/api/instructor/students/[id]` | Return one student's mastery and submission history |
| GET | `/api/instructor/submissions` | Return the instructor submission stream for detailed or legacy views |

## Instructor dashboard

- `/instructor` shows one row per student rather than one row per submission.
- Each row includes attempts, average grade, latest grade, completed assignments, skills attempted, and last submitted time.
- Instructors can drill into `/instructor/students/[id]` to inspect that student's mastery snapshot and full submission history.

## Deployment

Import this repository into Vercel, set the Supabase variables and required `GROQ_API_KEY`, then deploy. `GROQ_MODEL` is optional and defaults to `llama-3.1-8b-instant`. Grading intentionally returns HTTP 500 when the required Groq key is not configured.

## Future work

- Deterministic sandbox execution paired with LLM explanations and coaching feedback
- Per-test execution results for students and instructors
- Multi-skill assignment tagging instead of one-skill-per-assignment mapping
- Adaptive difficulty and assignment sequencing beyond fixed concept order
- Fitted and recalibrated BKT parameters from real learner data
- Richer instructor analytics for cohorts, trends, and intervention points
- More complete account management, including invites, password reset, and profile settings

## Current MVP limitations

- Returning users can log in with email/password, while new students can self-register from `/login`.
- Demo buttons on `/login` use the seeded demo student and instructor accounts.
- Invitation, password reset, and account-management flows remain future work.
- LLM grading is probabilistic; production should combine deterministic sandbox tests with LLM explanations.
- BKT parameters are expert defaults, not fitted to platform data.
- One skill is mapped to each assignment; production content may require multi-skill tagging and prerequisite constraints.
