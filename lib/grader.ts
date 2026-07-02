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
type GroqMessage = { role: "system" | "user"; content: string };

class GraderOutputError extends GraderError {
  constructor(message: string) {
    super(message, 502);
    this.name = "GraderOutputError";
  }
}

export async function gradeCode(code: string, assignment: GradingAssignment): Promise<GradeResult> {
  validateCode(code);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GraderError(
      "GROQ_API_KEY is not configured. LLM grading is required for this MVP.",
      500
    );
  }

  const messages = buildMessages(code, assignment);
  try {
    return parseGrade(await requestCompletion(apiKey, messages));
  } catch (error) {
    if (!(error instanceof GraderOutputError)) throw error;
  }

  return parseGrade(await requestCompletion(apiKey, [
    ...messages,
    {
      role: "user",
      content: "Your previous response failed the required JSON schema. Re-evaluate the same current submission and return exactly one valid JSON object. grade must be an integer, passed a boolean, feedback/hint/reasoning_summary non-empty strings, and mistakes an array of strings. Do not use null, markdown, or code fences."
    }
  ]));
}

async function requestCompletion(apiKey: string, messages: GroqMessage[]): Promise<string> {
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
        messages
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
  if (!content) throw new GraderOutputError("The LLM grader returned an empty response.");
  return content;
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
  const syntaxError = findStructuralSyntaxError(code);
  if (syntaxError) throw new GraderError(syntaxError, 400);
}

function findStructuralSyntaxError(code: string): string | null {
  const stack: Array<{ character: "(" | "[" | "{"; line: number }> = [];
  const pairs = { ")": "(", "]": "[", "}": "{" } as const;
  let quote: "'" | "\"" | "'''" | "\"\"\"" | null = null;
  let quoteLine = 1;
  let escaped = false;
  let comment = false;
  let line = 1;

  for (let index = 0; index < code.length; index += 1) {
    const character = code[index];
    if (comment) {
      if (character === "\n") {
        comment = false;
        line += 1;
      }
      continue;
    }
    if (quote) {
      if (quote.length === 3 && code.slice(index, index + 3) === quote) {
        quote = null;
        index += 2;
        continue;
      }
      if (quote.length === 1) {
        if (escaped) {
          escaped = false;
          if (character === "\n") line += 1;
          continue;
        }
        if (character === "\\") {
          escaped = true;
          continue;
        }
        if (character === quote) {
          quote = null;
          continue;
        }
        if (character === "\n") return `Syntax error: unterminated string on line ${quoteLine}.`;
      } else if (character === "\n") {
        line += 1;
      }
      continue;
    }
    if (character === "\n") {
      line += 1;
      continue;
    }
    if (character === "#") {
      comment = true;
      continue;
    }
    if (character === "'" || character === "\"") {
      const triple = character.repeat(3) as "'''" | "\"\"\"";
      quote = code.slice(index, index + 3) === triple ? triple : character;
      quoteLine = line;
      if (quote.length === 3) index += 2;
      continue;
    }
    if (character === "(" || character === "[" || character === "{") {
      stack.push({ character, line });
      continue;
    }
    if (character === ")" || character === "]" || character === "}") {
      const opener = stack.pop();
      if (!opener) return `Syntax error: unexpected "${character}" on line ${line}.`;
      if (opener.character !== pairs[character]) {
        return `Syntax error: "${opener.character}" on line ${opener.line} is closed by "${character}" on line ${line}.`;
      }
    }
  }

  if (quote) return `Syntax error: unterminated string on line ${quoteLine}.`;
  const opener = stack.at(-1);
  if (opener) {
    const closing = opener.character === "(" ? ")" : opener.character === "[" ? "]" : "}";
    return `Syntax error: missing closing "${closing}" for "${opener.character}" on line ${opener.line}.`;
  }
  return null;
}

function buildMessages(code: string, assignment: GradingAssignment): GroqMessage[] {
  return [
    {
      role: "system",
      content: [
        "You grade beginner Python submissions.",
        "Use the public tests, hidden tests, and rubric as the primary grading basis.",
        "Compare the current student code's behavior against every expected output.",
        "Check whether the current submission covers every required case, branch, category, or output described in the assignment and rubric, not just whether it gets some examples right.",
        "If syntax or runtime issues are present, still evaluate the intended solution for completeness using the visible code and explain which required cases or branches are still missing or incomplete.",
        "The reference solution only clarifies the intended behavior; never require identical code or a specific implementation unless the rubric explicitly requires it.",
        "Award 100 only when the current submission satisfies every required test and the complete rubric.",
        "If the current submission would fail any required test, assign a grade below 80.",
        "Grade unrelated, empty, incorrectly hardcoded, unsafe, or non-solving code very low.",
        "If the code handles only part of the assignment, explicitly say which required cases are missing, such as missing age ranges, branches, edge cases, outputs, or functions.",
        "Do not invent mistakes. Every issue in feedback or mistakes must be demonstrably present in the current submitted code.",
        "mistakes must include both structural problems like syntax or indentation errors and missing required logic when both are present.",
        "Do not provide full solution code. Give a useful hint without revealing the complete answer.",
        "Do not reveal hidden chain-of-thought. reasoning_summary must be a short, safe outcome summary.",
        "Return JSON only with exactly: grade, passed, feedback, mistakes, hint, reasoning_summary.",
        "grade must be an integer from 0 to 100; passed must equal whether grade is at least 80; mistakes must always be a JSON array of concrete strings.",
        "feedback, hint, and reasoning_summary must always be non-empty JSON strings, including for code with syntax errors. Never return null, markdown, or code fences."
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
    throw new GraderOutputError("The LLM grader returned invalid JSON. No grade was saved.");
  }

  if (!Number.isInteger(value.grade) || value.grade < 0 || value.grade > 100) {
    throw new GraderOutputError("The LLM grader returned an invalid grade. No grade was saved.");
  }
  if (
    typeof value.feedback !== "string" || !value.feedback.trim() ||
    !Array.isArray(value.mistakes) || !value.mistakes.every((item) => typeof item === "string") ||
    typeof value.hint !== "string" || !value.hint.trim() ||
    typeof value.reasoning_summary !== "string" || !value.reasoning_summary.trim()
  ) {
    throw new GraderOutputError("The LLM grader returned an invalid result. No grade was saved.");
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
