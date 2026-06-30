import { NextRequest, NextResponse } from "next/server";
import { assignments, demoMastery } from "@/lib/data";
import { gradeCode } from "@/lib/grader";
import { updateMastery, BKT } from "@/lib/bkt";
import { createSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.assignmentId !== "string" || typeof body.code !== "string") {
      return NextResponse.json({ error: "assignmentId and code are required." }, { status: 400 });
    }
    const assignment = assignments.find(a => a.id === body.assignmentId);
    if (!assignment) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

    const result = await gradeCode(body.code, assignment);
    const correct = result.grade === 100;

    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? createSupabaseClient()
      : null;

    let priorMastery = BKT.initial;
    let studentId = body.studentId ?? "demo-student";

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) studentId = user.id;

      const { data: mastery } = await supabase
        .from("student_mastery")
        .select("probability")
        .eq("student_id", studentId)
        .eq("skill", assignment.skill)
        .single();

      if (mastery) priorMastery = mastery.probability;
    }

    const newMastery = updateMastery(priorMastery, correct);

    if (supabase) {
      await supabase.from("submissions").insert({
        student_id: studentId,
        assignment_id: assignment.id,
        code: body.code,
        grade: result.grade,
        feedback: result.feedback
      });

      await supabase
        .from("student_mastery")
        .upsert({
          student_id: studentId,
          skill: assignment.skill,
          probability: newMastery,
          updated_at: new Date().toISOString()
        });
    }

    return NextResponse.json({
      ...result,
      mastery: Number(newMastery.toFixed(4)),
      studentId
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to grade submission." }, { status: 400 });
  }
}

