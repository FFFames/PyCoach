import { lowestMastery } from "@/lib/bkt";
import type { Assignment, Mastery, Skill } from "@/lib/types";

export const SKILL_ORDER: Skill[] = ["variables", "conditionals", "loops", "lists", "functions"];

export type RecommendationMode = "start" | "new_skill" | "weakest_skill";

export type LearningRecommendation = {
  assignment?: Assignment;
  skill?: Skill;
  mode: RecommendationMode;
  reason: string;
};

export function attemptedSkillsFromSubmissions(
  assignments: Assignment[],
  submissions: Array<{ assignment_id: string }>
): Skill[] {
  const assignmentSkills = new Map(assignments.map((assignment) => [assignment.id, assignment.skill]));
  const attempted = new Set(submissions.map((submission) => assignmentSkills.get(submission.assignment_id)).filter((skill): skill is Skill => Boolean(skill)));
  return SKILL_ORDER.filter((skill) => attempted.has(skill));
}

export function recommendLearningPath(
  assignments: Assignment[],
  mastery: Mastery,
  attemptedSkills: Skill[]
): LearningRecommendation {
  const attempted = new Set(attemptedSkills);
  if (attempted.size === 0) {
    const skill = SKILL_ORDER.find((candidate) => assignments.some((assignment) => assignment.skill === candidate));
    return {
      assignment: assignments.find((assignment) => assignment.skill === skill),
      skill,
      mode: "start",
      reason: "You haven’t attempted any assignments yet. Start with Variables to build your Python foundation."
    };
  }

  const nextSkill = SKILL_ORDER.find((skill) => !attempted.has(skill) && assignments.some((assignment) => assignment.skill === skill));
  if (nextSkill) {
    return {
      assignment: assignments.find((assignment) => assignment.skill === nextSkill),
      skill: nextSkill,
      mode: "new_skill",
      reason: `You have not attempted ${nextSkill} yet. This is the next concept in your learning path.`
    };
  }

  const skill = lowestMastery(mastery);
  return {
    assignment: assignments.find((assignment) => assignment.skill === skill) ?? assignments[0],
    skill,
    mode: "weakest_skill",
    reason: `Your ${skill} mastery has the most room to grow.`
  };
}
