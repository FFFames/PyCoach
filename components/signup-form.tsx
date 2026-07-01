"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!fullName || !email || password.length < 8) {
      setError("Enter your name, a valid email, and a password with at least 8 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    if (!data.session) {
      setSuccess("Account created. Check your email to confirm your account, then sign in.");
      setLoading(false);
      return;
    }
    router.replace("/student");
    router.refresh();
  }

  return <form onSubmit={submit} className="mt-8 space-y-4">
    <div>
      <label htmlFor="fullName" className="text-sm font-black text-ink">Full name</label>
      <input id="fullName" name="fullName" type="text" autoComplete="name" required disabled={loading} className="mt-2 w-full rounded-2xl border border-moss/20 bg-white px-4 py-3.5 outline-none focus:border-clay disabled:opacity-60"/>
    </div>
    <div>
      <label htmlFor="email" className="text-sm font-black text-ink">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required disabled={loading} className="mt-2 w-full rounded-2xl border border-moss/20 bg-white px-4 py-3.5 outline-none focus:border-clay disabled:opacity-60"/>
    </div>
    <div>
      <label htmlFor="password" className="text-sm font-black text-ink">Password</label>
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={loading} aria-describedby="password-help" className="mt-2 w-full rounded-2xl border border-moss/20 bg-white px-4 py-3.5 outline-none focus:border-clay disabled:opacity-60"/>
      <p id="password-help" className="mt-2 text-xs text-slate-500">Use at least 8 characters.</p>
    </div>
    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-clay px-5 py-4 font-black text-white disabled:opacity-60">
      {loading ? <Loader2 size={18} className="animate-spin"/> : null}
      {loading ? "Creating account…" : "Create student account"}
    </button>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
    {success ? <p role="status" className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-800">{success}</p> : null}
  </form>;
}
