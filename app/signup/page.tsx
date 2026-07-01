import Link from "next/link";
import { Sprout } from "lucide-react";
import { SignupForm } from "@/components/signup-form";

export default function Signup() {
  return <main className="grid min-h-screen place-items-center bg-ink p-6">
    <div className="w-full max-w-md rounded-[30px] bg-paper p-8 shadow-soft">
      <Link href="/" className="flex items-center gap-2 text-xl font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-lime"><Sprout size={20}/></span>PyCoach</Link>
      <p className="eyebrow mt-10">Student sign up</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Create your account.</h1>
      <p className="mt-3 leading-7 text-slate-600">Your progress, submissions, and mastery estimates will be private to your account.</p>
      <SignupForm/>
      <p className="mt-6 text-center text-sm text-slate-600">Already have an account or want demo access? <Link href="/login" className="font-black text-moss hover:text-clay">Go to login</Link></p>
    </div>
  </main>;
}
