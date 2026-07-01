import { NextResponse } from "next/server";
import { loadInstructorStudent } from "@/lib/instructor-data";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "instructor") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const detail = await loadInstructorStudent(id);
    return detail ? NextResponse.json(detail) : NextResponse.json({ error: "Student not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Unable to load student details." }, { status: 500 });
  }
}
