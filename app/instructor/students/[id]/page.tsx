import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, Clock3, Layers3, Target, Trophy } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { MasteryChart } from "@/components/mastery-chart";
import { Nav } from "@/components/nav";
import { loadInstructorStudent } from "@/lib/instructor-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default async function InstructorStudent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: instructorProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (instructorProfile?.role !== "instructor") redirect("/student");
  const detail = await loadInstructorStudent(id);
  if (!detail) notFound();
  const { student } = detail;

  const metrics = [
    [Clock3, String(student.totalAttempts), "Total attempts"],
    [BarChart3, `${student.averageGrade}%`, "Average grade"],
    [Target, student.latestGrade === null ? "—" : `${student.latestGrade}%`, "Latest grade"],
    [Trophy, String(student.completedAssignments), "Completed"],
    [Layers3, String(student.skillsAttempted), "Skills attempted"]
  ] as const;

  return <main className="min-h-screen">
    <Nav/>
    <section className="mx-auto max-w-7xl px-6 py-10">
      <Link href="/instructor" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink"><ArrowLeft size={17}/> Back to instructor overview</Link>
      <div className="mt-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="eyebrow">Student details</p><h1 className="mt-2 text-5xl font-black tracking-[-.045em]">{student.name}</h1><p className="mt-3 text-slate-600">{student.email ?? "Email unavailable"}</p></div>
        <p className="text-sm font-bold text-slate-500">Last submitted {formatDate(student.lastSubmittedAt)}</p>
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(([Icon,value,label]) => <div className="card p-5" key={label}><Icon size={20} className="text-clay"/><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold text-slate-500">{label}</p></div>)}
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <aside className="card p-7"><div className="flex items-center gap-2"><CheckCircle2 className="text-clay"/><h2 className="text-2xl font-black">Skill mastery</h2></div><div className="mt-6"><MasteryChart mastery={detail.mastery} attemptedSkills={detail.attemptedSkills}/></div></aside>
        <div className="card overflow-hidden">
          <div className="border-b border-moss/10 p-6"><h2 className="text-2xl font-black">Submission history</h2></div>
          {detail.submissions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#eef3eb] text-xs uppercase tracking-wider text-slate-500"><tr>{["Assignment","Skill","Grade","Feedback","Submitted"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead><tbody>{detail.submissions.map((submission) => <tr key={submission.id} className="border-t border-moss/10"><td className="px-5 py-5 font-bold">{submission.assignmentTitle}</td><td className="px-5 py-5 capitalize text-slate-500">{submission.skill}</td><td className="px-5 py-5"><span className={`rounded-full px-3 py-1 font-black ${submission.grade >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{submission.grade}%</span></td><td className="max-w-sm px-5 py-5 text-xs leading-5 text-slate-600">{submission.feedback}</td><td className="whitespace-nowrap px-5 py-5 text-slate-500">{formatDate(submission.submittedAt)}</td></tr>)}</tbody></table></div> : <p className="p-8 text-slate-600">This student has not submitted any assignments yet.</p>}
        </div>
      </div>
    </section>
  </main>;
}
