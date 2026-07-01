import type { Assignment, GradingAssignment, Mastery, Skill, Submission } from "@/lib/types";
import { BKT } from "@/lib/bkt";

export const PUBLIC_ASSIGNMENT_SELECT = "id,title,description,starter_code,difficulty,skill,tests,created_at";

export function mapAssignment(row: Record<string, unknown>): Assignment {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    starterCode: String(row.starter_code),
    difficulty: row.difficulty as Assignment["difficulty"],
    skill: row.skill as Skill,
    tests: (row.tests ?? []) as Assignment["tests"]
  };
}

export function mapGradingAssignment(row: Record<string, unknown>): GradingAssignment {
  return {
    ...mapAssignment(row),
    rubric: String(row.rubric ?? ""),
    referenceSolution: String(row.reference_solution ?? ""),
    hiddenTests: (row.hidden_tests ?? []) as GradingAssignment["hiddenTests"]
  };
}

export function mapMastery(rows: Array<{ skill: string; probability: number }>): Mastery {
  const base: Mastery = {
    variables: BKT.initial,
    conditionals: BKT.initial,
    loops: BKT.initial,
    lists: BKT.initial,
    functions: BKT.initial
  };
  rows.forEach(({ skill, probability }) => {
    if (skill in base) base[skill as Skill] = Number(probability);
  });
  return base;
}

export function mapSubmission(row: Record<string, unknown>): Submission {
  const profile = row.profiles as { full_name?: string } | null;
  const assignment = row.assignments as { title?: string; skill?: Skill } | null;
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: profile?.full_name ?? "Unknown student",
    assignmentId: String(row.assignment_id),
    assignmentTitle: assignment?.title ?? "Unknown assignment",
    skill: assignment?.skill ?? "variables",
    grade: Number(row.grade),
    feedback: String(row.feedback),
    submittedAt: String(row.submitted_at)
  };
}
