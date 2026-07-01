import type { GradingAssignment } from "./types";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const MAX_CODE_LENGTH = 10_000;
const FORBIDDEN = [
  /\bimport\s+(os|subprocess|socket|pathlib|shutil)\b/,
  /\bfrom\s+(os|subprocess|socket|pathlib|shutil)\b/,
  /\b(eval|exec|open|compile|__import__)\s*\(/
];

export type GradeResult = {
  grade: number;
  passed: boolean;
  feedback: string;
  mistakes: string[];
  hint: string;
  reasoning_summary: string;
  mode: "groq";
};

export class GraderError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "GraderError";
  }
}

type GroqPayload = Omit<GradeResult, "mode" | "passed"> & { passed?: unknown };

export async function gradeCode(code: string, assignment: GradingAssignment): Promise<GradeResult> {
  validateCode(code);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GraderError(
      "GROQ_API_KEY is not configured. LLM grading is required for this MVP.",
      500
    );
  }

  let response: Response;
  try {
    response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        temperature: 0,
        max_completion_tokens: 700,
        response_format: { type: "json_object" },
        messages: buildMessages(code, assignment)
      }),
      signal: AbortSignal.timeout(12_000)
    });
  } catch {
    throw new GraderError("The LLM grader is temporarily unavailable. Please try again.", 502);
  }

  if (!response.ok) {
    throw new GraderError("The LLM grader could not evaluate this submission.", 502);
  }

  const completion = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = completion.choices?.[0]?.message?.content;
  if (!content) throw new GraderError("The LLM grader returned an empty response.", 502);
  return parseGrade(content);
}

export function formatStoredFeedback(result: GradeResult): string {
  const mistakes = result.mistakes.length
    ? `Mistakes: ${result.mistakes.join("; ")}`
    : "Mistakes: none identified";
  return [result.feedback, mistakes, `Hint: ${result.hint}`].join("\n");
}

function validateCode(code: string) {
  if (!code.trim()) throw new GraderError("Code cannot be empty.", 400);
  if (code.length > MAX_CODE_LENGTH) throw new GraderError("Code is too long.", 400);
  if (FORBIDDEN.some((pattern) => pattern.test(code))) {
    throw new GraderError(
      "This demo blocks filesystem, process, network, and dynamic execution APIs.",
      400
    );
  }
}

function buildMessages(code: string, assignment: GradingAssignment) {
  return [
    {
      role: "system",
      content: [
        "You grade beginner Python submissions.",
        "Use the public tests, hidden tests, and rubric as the primary grading basis.",
        "Compare the current student code's behavior against every expected output.",
        "The reference solution only clarifies the intended behavior; never require identical code or a specific implementation unless the rubric explicitly requires it.",
        "Award 100 only when the current submission satisfies every required test and the complete rubric.",
        "If the current submission would fail any required test, assign a grade below 80.",
        "Grade unrelated, empty, incorrectly hardcoded, unsafe, or non-solving code very low.",
        "Do not invent mistakes. Every issue in feedback or mistakes must be demonstrably present in the current submitted code.",
        "Do not provide full solution code. Give a useful hint without revealing the complete answer.",
        "Do not reveal hidden chain-of-thought. reasoning_summary must be a short, safe outcome summary.",
        "Return JSON only with exactly: grade, passed, feedback, mistakes, hint, reasoning_summary.",
        "grade must be an integer from 0 to 100; passed must equal whether grade is at least 80; mistakes must be an array of concrete strings."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        assignment: {
          title: assignment.title,
          description: assignment.description,
          skill: assignment.skill,
          starter_code: assignment.starterCode,
          public_tests: assignment.tests,
          hidden_tests: assignment.hiddenTests,
          rubric: assignment.rubric,
          reference_solution: assignment.referenceSolution
        },
        student_code: code
      })
    }
  ];
}

function parseGrade(content: string): GradeResult {
  let value: GroqPayload;
  try {
    value = JSON.parse(content) as GroqPayload;
  } catch {
    throw new GraderError("The LLM grader returned invalid JSON. No grade was saved.", 502);
  }

  if (!Number.isInteger(value.grade) || value.grade < 0 || value.grade > 100) {
    throw new GraderError("The LLM grader returned an invalid grade. No grade was saved.", 502);
  }
  if (
    typeof value.feedback !== "string" || !value.feedback.trim() ||
    !Array.isArray(value.mistakes) || !value.mistakes.every((item) => typeof item === "string") ||
    typeof value.hint !== "string" || !value.hint.trim() ||
    typeof value.reasoning_summary !== "string" || !value.reasoning_summary.trim()
  ) {
    throw new GraderError("The LLM grader returned an invalid result. No grade was saved.", 502);
  }

  return {
    grade: value.grade,
    passed: value.grade >= 80,
    feedback: value.feedback.trim().slice(0, 1_000),
    mistakes: value.mistakes.map((item) => item.trim().slice(0, 300)).filter(Boolean).slice(0, 8),
    hint: value.hint.trim().slice(0, 600),
    reasoning_summary: value.reasoning_summary.trim().slice(0, 600),
    mode: "groq"
  };
}
