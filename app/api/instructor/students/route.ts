import { NextResponse } from "next/server";
import { loadInstructorOverview } from "@/lib/instructor-data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "instructor") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json(await loadInstructorOverview());
  } catch {
    return NextResponse.json({ error: "Unable to load students." }, { status: 500 });
  }
}
