import type { InstructorStudentSummary, Skill, Submission } from "@/lib/types";

export type StudentProfileRecord = { id: string; fullName: string };

export function summarizeStudent(
  profile: StudentProfileRecord,
  email: string | null,
  submissions: Submission[]
): InstructorStudentSummary {
  const latest = submissions.reduce<Submission | null>((current, submission) => {
    if (!current || new Date(submission.submittedAt).getTime() > new Date(current.submittedAt).getTime()) return submission;
    return current;
  }, null);
  const completedAssignments = new Set(submissions.filter((submission) => submission.grade >= 80).map((submission) => submission.assignmentId));
  const skillsAttempted = new Set<Skill>(submissions.map((submission) => submission.skill));
  return {
    id: profile.id,
    name: profile.fullName,
    email,
    totalAttempts: submissions.length,
    averageGrade: submissions.length ? Math.round(submissions.reduce((total, submission) => total + submission.grade, 0) / submissions.length) : 0,
    latestGrade: latest?.grade ?? null,
    completedAssignments: completedAssignments.size,
    skillsAttempted: skillsAttempted.size,
    lastSubmittedAt: latest?.submittedAt ?? null
  };
}

export function aggregateStudents(
  profiles: StudentProfileRecord[],
  emails: Map<string, string>,
  submissions: Submission[]
): InstructorStudentSummary[] {
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const grouped = new Map<string, Submission[]>();
  submissions.forEach((submission) => {
    const studentSubmissions = grouped.get(submission.studentId) ?? [];
    studentSubmissions.push(submission);
    grouped.set(submission.studentId, studentSubmissions);
  });
  return Array.from(grouped, ([studentId, studentSubmissions]) => summarizeStudent(
    profileMap.get(studentId) ?? { id: studentId, fullName: studentSubmissions[0]?.studentName ?? "Unknown student" },
    emails.get(studentId) ?? null,
    studentSubmissions
  )).sort((first, second) => new Date(second.lastSubmittedAt ?? 0).getTime() - new Date(first.lastSubmittedAt ?? 0).getTime());
}
