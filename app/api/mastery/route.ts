import { NextResponse } from "next/server";
import { demoMastery } from "@/lib/data";
import { createSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createSupabaseClient()
    : null;

  if (!supabase) return NextResponse.json(demoMastery);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(demoMastery);

  const { data: mastery } = await supabase
    .from("student_mastery")
    .select("skill, probability")
    .eq("student_id", user.id);

  const result = { variables: 0.3, conditionals: 0.3, loops: 0.3, lists: 0.3, functions: 0.3 };
  for (const row of mastery ?? []) result[row.skill as keyof typeof result] = row.probability;

  return NextResponse.json(result);
}

