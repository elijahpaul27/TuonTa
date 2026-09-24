"use client";

import { ShieldCheck } from "lucide-react";

export function AdminHeader() {
  return (
    <div className="flex items-center justify-between !bg-white/70 !backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-csc-blue-dark" />
        <div>
          <h1 className="text-3xl font-bold text-csc-blue-dark">Admin QA Dashboard</h1>
          <p className="text-slate-600">Review and verify DRAFT questions before they enter the RAG database.</p>
        </div>
      </div>
    </div>
  );
}
