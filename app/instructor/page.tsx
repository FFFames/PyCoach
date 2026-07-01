import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { loadInstructorOverview } from "@/lib/instructor-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default async function Instructor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "instructor") redirect("/student");

  const overview = await loadInstructorOverview();
  return <main className="min-h-screen">
    <Nav/>
    <section className="mx-auto max-w-7xl px-6 py-10">
      <p className="eyebrow">Instructor overview</p>
      <h1 className="mt-2 text-5xl font-black tracking-[-.045em]">Class pulse</h1>
      <p className="mt-3 text-slate-600">One row per learner, with drill-down access to their full submission history.</p>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {[[Users,String(overview.students.length),"Students with attempts"],[BarChart3,`${overview.averageGrade}%`,"Average grade"],[Clock3,String(overview.totalAttempts),"Total attempts"]].map(([Icon,value,label]) => <div className="card p-6" key={String(label)}><Icon className="text-clay"/><p className="mt-6 text-4xl font-black">{value as string}</p><p className="mt-1 text-sm font-bold text-slate-500">{label as string}</p></div>)}
      </div>
      <div className="card mt-7 overflow-hidden">
        <div className="border-b border-moss/10 p-6"><h2 className="text-2xl font-black">Student overview</h2></div>
        {overview.students.length ? <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#eef3eb] text-xs uppercase tracking-wider text-slate-500"><tr>{["Student","Attempts","Average","Latest","Completed","Skills","Last submitted",""].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead>
            <tbody>{overview.students.map((student) => <tr key={student.id} className="border-t border-moss/10">
              <td className="px-5 py-5"><p className="font-black">{student.name}</p><p className="mt-1 text-xs text-slate-500">{student.email ?? "Email unavailable"}</p></td>
              <td className="px-5 py-5 font-bold">{student.totalAttempts}</td>
              <td className="px-5 py-5 font-bold">{student.averageGrade}%</td>
              <td className="px-5 py-5"><span className={`rounded-full px-3 py-1 font-black ${Number(student.latestGrade) >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{student.latestGrade ?? "—"}{student.latestGrade === null ? "" : "%"}</span></td>
              <td className="px-5 py-5 font-bold">{student.completedAssignments}</td>
              <td className="px-5 py-5 font-bold">{student.skillsAttempted}</td>
              <td className="px-5 py-5 text-slate-500">{formatDate(student.lastSubmittedAt)}</td>
              <td className="px-5 py-5"><Link href={`/instructor/students/${student.id}`} className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-ink px-4 py-2 font-black text-white">View details <ArrowRight size={15}/></Link></td>
            </tr>)}</tbody>
          </table>
        </div> : <p className="p-8 text-slate-600">No submissions yet. Student progress will appear after the first attempt.</p>}
      </div>
    </section>
  </main>;
}
