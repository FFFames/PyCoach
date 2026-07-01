import { describe, expect, it } from "vitest";
import { assignments } from "@/lib/data";
import { recommendLearningPath } from "@/lib/recommendation";
import type { Mastery, Skill } from "@/lib/types";

const mastery: Mastery = { variables: 0.9, conditionals: 0.8, loops: 0.7, lists: 0.4, functions: 0.6 };

describe("learning path recommendations", () => {
  it("starts a new student with variables without describing mastery", () => {
    const recommendation = recommendLearningPath([...assignments].reverse(), mastery, []);
    expect(recommendation).toMatchObject({ mode: "start", skill: "variables", assignment: { id: "variables" } });
    expect(recommendation.reason).toContain("haven’t attempted any assignments");
    expect(recommendation.reason).not.toContain("mastery");
  });

  it("recommends the next unattempted skill in learning order", () => {
    const recommendation = recommendLearningPath(assignments, mastery, ["variables"]);
    expect(recommendation).toMatchObject({ mode: "new_skill", skill: "conditionals", assignment: { id: "conditionals" } });
    expect(recommendation.reason).toContain("not attempted conditionals");
  });

  it("skips attempted skills when choosing the next concept", () => {
    const attempted: Skill[] = ["variables", "conditionals", "loops", "lists"];
    expect(recommendLearningPath(assignments, mastery, attempted)).toMatchObject({ mode: "new_skill", skill: "functions" });
  });

  it("uses lowest BKT mastery only after all skills are attempted", () => {
    const attempted: Skill[] = ["variables", "conditionals", "loops", "lists", "functions"];
    const recommendation = recommendLearningPath(assignments, mastery, attempted);
    expect(recommendation).toMatchObject({ mode: "weakest_skill", skill: "lists", assignment: { id: "lists" } });
    expect(recommendation.reason).toContain("lists mastery");
  });
});
