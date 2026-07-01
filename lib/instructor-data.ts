import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { aggregateStudents, summarizeStudent } from "@/lib/instructor-aggregation";
import { mapMastery } from "@/lib/supabase/mappers";
import type { InstructorStudentDetail, InstructorStudentSummary, Skill, Submission } from "@/lib/types";

const SUBMISSION_SELECT = "id,student_id,assignment_id,grade,feedback,submitted_at,assignments(title,skill)";

function mapInstructorSubmission(row: Record<string, unknown>, studentName: string): Submission {
  const assignment = row.assignments as { title?: string; skill?: Skill } | null;
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    studentName,
    assignmentId: String(row.assignment_id),
    assignmentTitle: assignment?.title ?? "Unknown assignment",
    skill: assignment?.skill ?? "variables",
    grade: Number(row.grade),
    feedback: String(row.feedback),
    submittedAt: String(row.submitted_at)
  };
}

export async function loadInstructorOverview(): Promise<{students:InstructorStudentSummary[];totalAttempts:number;averageGrade:number}> {
  const admin = createAdminClient();
  const [{ data: profileRows, error: profileError }, { data: submissionRows, error: submissionError }, { data: authData, error: authError }] = await Promise.all([
    admin.from("profiles").select("id,full_name").eq("role", "student"),
    admin.from("submissions").select(SUBMISSION_SELECT).order("submitted_at", { ascending: false }),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  ]);
  if (profileError || submissionError || authError) throw new Error("Unable to load instructor overview.");
  const profiles = (profileRows ?? []).map((row) => ({ id: row.id, fullName: row.full_name }));
  const profileNames = new Map(profiles.map((profile) => [profile.id, profile.fullName]));
  const emails = new Map(authData.users.map((user) => [user.id, user.email ?? ""]));
  const submissions = (submissionRows ?? []).map((row) => mapInstructorSubmission(row as unknown as Record<string, unknown>, profileNames.get(row.student_id) ?? "Unknown student"));
  return {
    students: aggregateStudents(profiles, emails, submissions),
    totalAttempts: submissions.length,
    averageGrade: submissions.length ? Math.round(submissions.reduce((total, submission) => total + submission.grade, 0) / submissions.length) : 0
  };
}

export async function loadInstructorStudent(studentId: string): Promise<InstructorStudentDetail | null> {
  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin.from("profiles").select("id,full_name,role").eq("id", studentId).maybeSingle();
  if (profileError || !profile || profile.role !== "student") return null;
  const [{ data: submissionRows, error: submissionError }, { data: masteryRows, error: masteryError }, { data: authData, error: authError }] = await Promise.all([
    admin.from("submissions").select(SUBMISSION_SELECT).eq("student_id", studentId).order("submitted_at", { ascending: false }),
    admin.from("student_mastery").select("skill,probability").eq("student_id", studentId),
    admin.auth.admin.getUserById(studentId)
  ]);
  if (submissionError || masteryError || authError) throw new Error("Unable to load student details.");
  const submissions = (submissionRows ?? []).map((row) => mapInstructorSubmission(row as unknown as Record<string, unknown>, profile.full_name));
  const attemptedSkills = Array.from(new Set(submissions.map((submission) => submission.skill)));
  return {
    student: summarizeStudent({ id: profile.id, fullName: profile.full_name }, authData.user.email ?? null, submissions),
    mastery: mapMastery((masteryRows ?? []).map((row) => ({ skill: row.skill, probability: Number(row.probability) }))),
    attemptedSkills,
    submissions
  };
}
