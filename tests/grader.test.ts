import { afterEach, describe, expect, it, vi } from "vitest";
import { formatStoredFeedback, gradeCode } from "@/lib/grader";
import { assignments } from "@/lib/data";
import { mapAssignment } from "@/lib/supabase/mappers";

const assignment = assignments.find((item) => item.id === "loops")!;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Groq grader", () => {
  it("provides complete grading context for every assignment", () => {
    for (const item of assignments) {
      expect(item.tests.length + item.hiddenTests.length).toBeGreaterThanOrEqual(4);
      expect(item.tests.length + item.hiddenTests.length).toBeLessThanOrEqual(6);
      expect(item.rubric).not.toBe("");
      expect(item.referenceSolution).not.toBe("");
    }
  });

  it("does not include grading-only fields in public assignment mapping", () => {
    const publicAssignment = mapAssignment({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      starter_code: assignment.starterCode,
      difficulty: assignment.difficulty,
      skill: assignment.skill,
      tests: assignment.tests,
      hidden_tests: assignment.hiddenTests,
      rubric: assignment.rubric,
      reference_solution: assignment.referenceSolution
    });
    expect(publicAssignment).not.toHaveProperty("hiddenTests");
    expect(publicAssignment).not.toHaveProperty("rubric");
    expect(publicAssignment).not.toHaveProperty("referenceSolution");
  });

  it("fails clearly when GROQ_API_KEY is missing", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    await expect(gradeCode("print(1)", assignment)).rejects.toMatchObject({
      message: "GROQ_API_KEY is not configured. LLM grading is required for this MVP.",
      status: 500
    });
  });

  it("returns a validated grade and derives passed from the score", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        grade: 45,
        passed: true,
        feedback: "The loop does not calculate the requested sum.",
        mistakes: ["The accumulator is never updated."],
        hint: "Track a running total inside the loop.",
        reasoning_summary: "The submission would fail the provided tests."
      }) } }]
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await gradeCode("for i in range(5): print(i)", assignment);
    expect(result).toMatchObject({ grade: 45, passed: false, mode: "groq" });
    expect(result.mistakes).toEqual(["The accumulator is never updated."]);
    expect(formatStoredFeedback(result)).toContain("Hint: Track a running total");
    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(request.model).toBe("llama-3.1-8b-instant");
    expect(request.messages[1].content).toContain('"starter_code"');
    expect(request.messages[1].content).toContain('"public_tests"');
    expect(request.messages[1].content).toContain('"hidden_tests"');
    expect(request.messages[1].content).toContain('"rubric"');
    expect(request.messages[1].content).toContain('"reference_solution"');
    expect(request.messages[1].content).toContain('"student_code"');
    expect(request.messages[0].content).toContain("Do not invent mistakes");
  });

  it("rejects invalid model JSON instead of silently passing", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      choices: [{ message: { content: "not-json" } }]
    }), { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);
    await expect(gradeCode("print(1)", assignment)).rejects.toThrow("invalid JSON");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries once when Groq returns an invalid result shape", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const invalidResult = JSON.stringify({
      grade: 10,
      passed: false,
      feedback: "The code has an unclosed parenthesis.",
      mistakes: "Missing closing parenthesis",
      hint: "Close the print call.",
      reasoning_summary: "The code cannot run."
    });
    const validResult = JSON.stringify({
      grade: 10,
      passed: false,
      feedback: "The code has an unclosed parenthesis.",
      mistakes: ["The print call is missing its closing parenthesis."],
      hint: "Close the print call with a parenthesis.",
      reasoning_summary: "The syntax error prevents the submission from running."
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: invalidResult } }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: validResult } }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await gradeCode('print("15"', assignment);
    expect(result).toMatchObject({ grade: 10, passed: false });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryRequest = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(retryRequest.messages.at(-1).content).toContain("failed the required JSON schema");
  });

  it("blocks dangerous APIs before calling Groq", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(gradeCode("import os\nprint(os.listdir())", assignment)).rejects.toThrow("blocks");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
