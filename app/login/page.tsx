import Link from "next/link";
import { redirect } from "next/navigation";
import { Sprout } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function Login() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role === "instructor") redirect("/instructor");
    if (profile?.role === "student") redirect("/student");
  }

  return <main className="grid min-h-screen place-items-center bg-ink p-6">
    <div className="w-full max-w-xl rounded-[30px] bg-paper p-8 shadow-soft">
      <Link href="/" className="flex items-center gap-2 text-xl font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-lime"><Sprout size={20}/></span>PyCoach</Link>
      <p className="eyebrow mt-10">Supabase auth</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Welcome back.</h1>
      <p className="mt-3 leading-7 text-slate-600">Use your own email and password to continue learning, create a new student account, or explore with seeded demo accounts.</p>
      <LoginForm/>
      <section className="mt-8 border-t border-moss/10 pt-8">
        <p className="text-sm font-black text-ink">Create a new student account</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Public registration creates student accounts only. Instructor access is managed separately.</p>
        <SignupForm/>
      </section>
      {user ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">We found an authenticated session, but this account does not have a learner or instructor profile yet.</p> : null}
    </div>
  </main>;
}
