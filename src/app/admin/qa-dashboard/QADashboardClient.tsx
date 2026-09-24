"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionQATable } from "@/components/admin/QuestionQATable";
import { QAInspectModal } from "@/components/admin/QAInspectModal";
import { QuestionUploadForm } from "@/components/admin/QuestionUploadForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AIGeneratorModal } from "@/components/admin/AIGeneratorModal";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Question } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";

interface QADashboardClientProps {
  initialQuestions: Question[];
}

export function QADashboardClient({ initialQuestions }: QADashboardClientProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const router = useRouter();

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    const previousQuestions = [...questions];
    setQuestions(prev => prev.filter(q => q.id !== id));

    try {
      const response = await fetch(`/api/admin/questions/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, qaNotes: notes })
      });

      if (response.ok) {
        router.refresh();
      } else {
        throw new Error("Verification failed on the server.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setQuestions(previousQuestions);
      toast.error("Action Failed", { description: "Reverted changes due to server error." });
    }
  };

  const handleBulkVerify = async (ids: string[]) => {
    const previousQuestions = [...questions];
    setQuestions(prev => prev.filter(q => !ids.includes(q.id)));

    try {
      const response = await fetch('/api/admin/questions/bulk-verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        throw new Error("Bulk verification failed on the server.");
      }
    } catch (error) {
      console.error("Bulk verification error:", error);
      setQuestions(previousQuestions);
      toast.error("Action Failed", { description: "Reverted changes due to server error." });
    }
  };

  return (
    <div className="min-h-screen bg-csc-blue-light bg-doodle p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <AdminHeader />

        {/* ── System Health Metrics ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <HoverInteractWrapper scaleAmt={1.02}>
            <Card className="!bg-white/70 !backdrop-blur-md border-slate-200/60 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Verified</p>
                <h3 className="text-3xl font-bold text-csc-blue-dark">1,248</h3>
              </CardContent>
            </Card>
          </HoverInteractWrapper>
          <HoverInteractWrapper scaleAmt={1.02}>
            <Card className="!bg-white/70 !backdrop-blur-md border-slate-200/60 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-1">Pending QA</p>
                <h3 className="text-3xl font-bold text-csc-yellow">{questions.length}</h3>
              </CardContent>
            </Card>
          </HoverInteractWrapper>
          <HoverInteractWrapper scaleAmt={1.02}>
            <Card className="!bg-white/70 !backdrop-blur-md border-slate-200/60 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-1">AI Generations Today</p>
                <h3 className="text-3xl font-bold text-csc-blue-dark">15</h3>
              </CardContent>
            </Card>
          </HoverInteractWrapper>
        </div>

        <div>
          <h2 className="text-xl font-bold text-csc-blue-dark mb-4">Pending Verification ({questions.length})</h2>
          <QuestionQATable 
            questions={questions} 
            onInspect={setSelectedQuestion}
            onBulkVerify={handleBulkVerify}
          />
        </div>

        {/* ── Add New Question ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-csc-blue-dark" />
              <h2 className="text-xl font-bold text-csc-blue-dark">Upload New Question</h2>
            </div>
            <AIGeneratorModal />
          </div>
          <QuestionUploadForm />
        </div>
      </div>

      <QAInspectModal 
        question={selectedQuestion} 
        isOpen={!!selectedQuestion} 
        onClose={() => setSelectedQuestion(null)}
        onVerify={handleVerify}
      />
    </div>
  );
}
