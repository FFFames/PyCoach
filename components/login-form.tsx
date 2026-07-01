"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEMOS = {
  student: { email: "student@pycoach.demo", password: "PyCoachDemo!2026" },
  instructor: { email: "instructor@pycoach.demo", password: "PyCoachDemo!2026" }
} as const;

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<keyof typeof DEMOS | null>(null);
  const [error, setError] = useState("");

  async function signIn(role: keyof typeof DEMOS) {
    setLoading(role);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword(DEMOS[role]);
    if (authError) {
      setError(authError.message);
      setLoading(null);
      return;
    }
    router.push(role === "student" ? "/student" : "/instructor");
    router.refresh();
  }

  return <div className="mt-8 space-y-3">
    <button disabled={loading !== null} onClick={() => signIn("student")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-clay px-5 py-4 font-black text-white disabled:opacity-60">
      {loading === "student" && <Loader2 size={18} className="animate-spin"/>} Continue as student
    </button>
    <button disabled={loading !== null} onClick={() => signIn("instructor")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-moss/20 bg-white px-5 py-4 font-black disabled:opacity-60">
      {loading === "instructor" && <Loader2 size={18} className="animate-spin"/>} Continue as instructor
    </button>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
  </div>;
}
