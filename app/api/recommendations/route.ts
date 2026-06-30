import { NextResponse } from "next/server";
import { assignments, demoMastery } from "@/lib/data";
import { lowestMastery } from "@/lib/bkt";
import { createSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createSupabaseClient()
    : null;

  let mastery = demoMastery;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: masteryData } = await supabase
        .from("student_mastery")
        .select("skill, probability")
        .eq("student_id", user.id);

      const result = { variables: 0.3, conditionals: 0.3, loops: 0.3, lists: 0.3, functions: 0.3 };
      for (const row of masteryData ?? []) result[row.skill as keyof typeof result] = row.probability;
      mastery = result;
    }
  }

  const skill = lowestMastery(mastery);
  return NextResponse.json({
    reason: `Lowest estimated mastery: ${skill}`,
    assignment: assignments.find(a => a.skill === skill)
  });
}

