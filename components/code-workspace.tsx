"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Play, RotateCcw, XCircle } from "lucide-react";
import type { Assignment, Skill } from "@/lib/types";
import type { GradeResult } from "@/lib/grader";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="grid h-[430px] place-items-center bg-[#17221b] text-white/60"><Loader2 className="animate-spin"/></div>
});

type GradeResponse = GradeResult & {
  mastery: number;
  skill: Skill;
  assignmentId: string;
};

type RecommendationResponse = {
  reason: string;
  assignment?: Assignment;
};

export function CodeWorkspace({ assignment }: { assignment: Assignment }) {
  const [code, setCode] = useState(assignment.starterCode);
  const [result, setResult] = useState<GradeResponse | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    setResult(null);
    setRecommendation(null);
    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assignmentId: assignment.id, code })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setResult(body as GradeResponse);

      setRecommendationLoading(true);
      const recommendationResponse = await fetch("/api/recommendations");
      if (recommendationResponse.ok) {
        setRecommendation(await recommendationResponse.json() as RecommendationResponse);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not grade your code.");
    } finally {
      setLoading(false);
      setRecommendationLoading(false);
    }
  }

  function tryAgain() {
    setResult(null);
    setRecommendation(null);
    setError("");
  }

  const recommendedAssignment = result?.passed ? recommendation?.assignment : assignment;

  return <div className="overflow-hidden rounded-[26px] border border-white/10 bg-ink shadow-soft">
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-white">
      <div className="flex gap-2"><i className="h-3 w-3 rounded-full bg-red-400"/><i className="h-3 w-3 rounded-full bg-yellow-300"/><i className="h-3 w-3 rounded-full bg-green-400"/></div>
      <span className="font-mono text-xs text-white/45">solution.py</span>
      <button onClick={submit} disabled={loading} className="flex items-center gap-2 rounded-full bg-lime px-5 py-2 text-sm font-black text-ink disabled:opacity-60">
        {loading ? <Loader2 size={16} className="animate-spin"/> : <Play size={16} fill="currentColor"/>}
        {loading ? "Grading…" : "Grade solution"}
      </button>
    </div>
    <Editor height="430px" defaultLanguage="python" theme="vs-dark" value={code} onChange={(value) => setCode(value ?? "")} options={{ fontSize: 14, fontLigatures: true, minimap: { enabled: false }, padding: { top: 20 }, scrollBeyondLastLine: false, automaticLayout: true }}/>
    {(result || error) && <div className="border-t border-white/10 bg-[#101812] p-5 text-sm text-white">
      {error ? <div className="flex items-center gap-2 text-red-300"><XCircle size={18}/>{error}</div> : result && <div className="space-y-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className={result.passed ? "text-lime" : "text-yellow-300"}/>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${result.passed ? "bg-lime text-ink" : "bg-yellow-300/15 text-yellow-200"}`}>{result.passed ? "Passed" : "Keep practicing"}</span>
            </div>
            <p className="mt-3 font-bold text-white/90">{result.feedback}</p>
          </div>
          <span className="text-3xl font-black text-lime">{result.grade}%</span>
        </div>

        {result.mistakes.length > 0 && <div><p className="text-xs font-black uppercase tracking-wider text-white/45">What to improve</p><ul className="mt-2 space-y-1 text-white/80">{result.mistakes.map((mistake) => <li key={mistake}>• {mistake}</li>)}</ul></div>}
        <div className="rounded-xl bg-white/5 p-3"><p className="text-xs font-black uppercase tracking-wider text-lime">Hint</p><p className="mt-1 text-white/80">{result.hint}</p></div>
        <p className="text-xs text-white/55">{result.reasoning_summary}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-white/45">Updated {result.skill} mastery</p>
            <p className="mt-2 text-3xl font-black text-lime">{Math.round(result.mastery * 100)}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-lime" style={{ width: `${result.mastery * 100}%` }}/></div>
          </div>
          <div className="rounded-2xl border border-lime/20 bg-lime/10 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-lime">Recommended next</p>
            {recommendationLoading ? <p className="mt-3 flex items-center gap-2 text-white/65"><Loader2 size={15} className="animate-spin"/> Updating your path…</p> : recommendedAssignment ? <><p className="mt-2 text-lg font-black">{recommendedAssignment.title}</p><p className="mt-1 text-xs leading-5 text-white/60">{result.passed ? recommendation?.reason ?? "Continue with your weakest skill." : "Review this skill and try the assignment again before moving on."}</p></> : <p className="mt-3 text-white/65">Return to your dashboard to choose another exercise.</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!result.passed ? <button onClick={tryAgain} className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-black text-ink"><RotateCcw size={16}/> Try Again</button> : recommendedAssignment ? <Link href={`/assignments/${recommendedAssignment.id}`} className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-black text-ink">Continue to Recommended Assignment <ArrowRight size={16}/></Link> : <Link href="/student" className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-black text-ink">Back to Dashboard <ArrowRight size={16}/></Link>}
          <Link href="/student" className="rounded-full px-4 py-2.5 font-bold text-white/60 hover:text-white">View dashboard</Link>
        </div>
        <p className="text-xs text-white/35">Grader: Groq LLM</p>
      </div>}
    </div>}
  </div>;
}
