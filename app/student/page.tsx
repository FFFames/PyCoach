import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Nav } from "@/components/nav";
import { AssignmentCard } from "@/components/assignment-card";
import { MasteryChart } from "@/components/mastery-chart";
import { assignments, demoMastery } from "@/lib/data";
import { lowestMastery } from "@/lib/bkt";
import type { Mastery } from "@/lib/types";

async function getMastery(): Promise<Mastery> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/mastery`, { cache: "no-store" });
    if (!res.ok) return demoMastery;
    return await res.json();
  } catch {
    return demoMastery;
  }
}

async function getRecommendation() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/recommendations`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function Student() {
  const [mastery, rec] = await Promise.all([getMastery(), getRecommendation()]);
  const weakest = lowestMastery(mastery);
  const recommended = rec?.assignment ?? assignments.find(a => a.skill === weakest)!;

  return <main className="min-h-screen"><Nav /><section className="mx-auto max-w-7xl px-6 py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Student workspace</p><h1 className="mt-2 text-5xl font-black tracking-[-.045em]">Good morning, Maya.</h1><p className="mt-3 text-slate-600">Keep the loop going: attempt, learn, adjust.</p></div><div className="rounded-full bg-white px-5 py-3 text-sm font-bold shadow-sm">2 completed · 3 to explore</div></div><div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_.8fr]"><div className="rounded-[28px] bg-ink p-8 text-white"><div className="flex items-center gap-2 text-lime"><Sparkles size={18} /><p className="eyebrow !text-lime">Recommended next</p></div><h2 className="mt-4 text-4xl font-black">{recommended.title}</h2><p className="mt-3 max-w-xl leading-7 text-white/65">Your {weakest} mastery has the most room to grow. This exercise is the shortest path to a stronger foundation.</p><Link href={`/assignments/${recommended.id}`} className="mt-7 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 font-black text-ink hover:gap-3">Open exercise <ArrowRight size={18} /></Link></div><aside className="card p-7"><p className="eyebrow">Your skill map</p><h2 className="mb-6 mt-2 text-2xl font-black">Mastery</h2><MasteryChart mastery={mastery} /></aside></div><div className="mt-16"><p className="eyebrow">Exercise library</p><h2 className="mt-2 text-3xl font-black">Build one concept at a time.</h2><div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{assignments.map((a, i) => <AssignmentCard key={a.id} assignment={a} index={i} />)}</div></div></section></main>;
}

