"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";

type DemoRole = keyof typeof DEMO_ACCOUNTS;

export function DemoRoleSwitch({ role, label, className }: { role: DemoRole; label: string; className: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function switchRole() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword(DEMO_ACCOUNTS[role]);
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.replace(role === "student" ? "/student" : "/instructor");
    router.refresh();
  }

  return <>
    <button type="button" disabled={loading} onClick={switchRole} className={className}>
      {loading && <Loader2 size={14} className="animate-spin"/>}
      {loading ? "Switching…" : label}
    </button>
    {error && <span role="alert" className="sr-only">Could not switch demo view: {error}</span>}
  </>;
}
