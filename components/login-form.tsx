"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<"login" | keyof typeof DEMO_ACCOUNTS | null>(null);
  const [error, setError] = useState("");

  async function routeAuthenticatedUser() {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("We could not confirm your account after signing in. Please try again.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      throw new Error("We signed you in, but could not load your profile. Please try again.");
    }
    if (!profile?.role) {
      await supabase.auth.signOut();
      throw new Error("This account does not have a learner or instructor profile yet.");
    }

    router.replace(profile.role === "instructor" ? "/instructor" : "/student");
    router.refresh();
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("login");
    setError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email and password.");
      setLoading(null);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === "Invalid login credentials" ? "Incorrect email or password." : authError.message);
      setLoading(null);
      return;
    }

    try {
      await routeAuthenticatedUser();
    } catch (routingError) {
      setError(routingError instanceof Error ? routingError.message : "Unable to finish signing you in.");
      setLoading(null);
    }
  }

  async function signInDemo(role: keyof typeof DEMO_ACCOUNTS) {
    setLoading(role);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword(DEMO_ACCOUNTS[role]);
    if (authError) {
      setError(authError.message);
      setLoading(null);
      return;
    }

    try {
      await routeAuthenticatedUser();
    } catch (routingError) {
      setError(routingError instanceof Error ? routingError.message : "Unable to finish signing you in.");
      setLoading(null);
    }
  }

  return <div className="mt-8 space-y-8">
    <section>
      <p className="text-sm font-black text-ink">Login to your account</p>
      <form onSubmit={submitLogin} className="mt-4 space-y-4">
        <div>
          <label htmlFor="login-email" className="text-sm font-black text-ink">Email</label>
          <input id="login-email" name="email" type="email" autoComplete="email" required disabled={loading !== null} className="mt-2 w-full rounded-2xl border border-moss/20 bg-white px-4 py-3.5 outline-none focus:border-clay disabled:opacity-60"/>
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-black text-ink">Password</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required disabled={loading !== null} className="mt-2 w-full rounded-2xl border border-moss/20 bg-white px-4 py-3.5 outline-none focus:border-clay disabled:opacity-60"/>
        </div>
        <button type="submit" disabled={loading !== null} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-clay px-5 py-4 font-black text-white disabled:opacity-60">
          {loading === "login" ? <Loader2 size={18} className="animate-spin"/> : null}
          {loading === "login" ? "Logging in…" : "Log in"}
        </button>
      </form>
    </section>

    <section className="border-t border-moss/10 pt-8">
      <p className="text-sm font-black text-ink">Demo accounts</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">These buttons sign into seeded demo users so you can explore the app safely.</p>
      <div className="mt-4 space-y-3">
        <button disabled={loading !== null} onClick={() => signInDemo("student")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-moss/20 bg-white px-5 py-4 font-black disabled:opacity-60">
          {loading === "student" && <Loader2 size={18} className="animate-spin"/>} Continue as Demo Student
        </button>
        <button disabled={loading !== null} onClick={() => signInDemo("instructor")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-moss/20 bg-white px-5 py-4 font-black disabled:opacity-60">
          {loading === "instructor" && <Loader2 size={18} className="animate-spin"/>} Continue as Demo Instructor
        </button>
      </div>
    </section>

    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
  </div>;
}
