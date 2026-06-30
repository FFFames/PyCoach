import { NextResponse } from "next/server";
import { demoSubmissions } from "@/lib/data";
import { createSupabaseClient } from "@/lib/supabase";
import type { Submission } from "@/lib/types";

export async function GET() {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createSupabaseClient()
    : null;

  if (!supabase) return NextResponse.json(demoSubmissions);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(demoSubmissions);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id,
      student_id,
      assignment_id,
      grade,
      feedback,
      submitted_at,
      profiles!submissions_student_id_fkey (full_name),
      assignments (title, skill)
    `)
    .order("submitted_at", { ascending: false })
    .limit(50);

  const result: Submission[] = (submissions ?? []).map((s: any) => ({
    id: s.id,
    studentId: s.student_id,
    studentName: s.profiles?.full_name ?? "Unknown",
    assignmentId: s.assignment_id,
    assignmentTitle: s.assignments?.title ?? "Unknown",
    skill: s.assignments?.skill ?? "variables",
    grade: s.grade,
    feedback: s.feedback,
    submittedAt: s.submitted_at
  }));

  return NextResponse.json(result);
}

