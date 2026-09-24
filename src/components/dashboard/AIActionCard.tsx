"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { db, SerializedQuestion } from "@/lib/db";
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";

interface AIRecommendation {
  focusArea: string;
  reason: string;
  actionableStep: string;
}

interface AIActionCardProps {
  recommendation: AIRecommendation;
}

export function AIActionCard({ recommendation }: AIActionCardProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePracticeWeakAreas = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/exams/generate-targeted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate targeted quiz.");
      }

      const data: {
        sessionId: string;
        type: string;
        questionBank: SerializedQuestion[];
      } = await res.json();

      // Store the question bank in Dexie so the exam runner can load it offline
      await db.offlineSessions.put({
        sessionId: data.sessionId,
        examLevel: data.type,
        // Weakness review: 20 mins (1200s); Quick practice: 15 mins (900s)
        timeRemainingSecs: data.type === "WEAKNESS_REVIEW" ? 1200 : 900,
        answers: {},
        lastUpdated: Date.now(),
        syncStatus: "pending",
        questionBank: data.questionBank,
      });

      // Navigate to the exam runner
      router.push(`/test-center/exam/${data.sessionId}`);
    } catch (err: unknown) {
      console.error("[AIActionCard] Error generating targeted quiz:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setIsGenerating(false);
    }
  };

  return (
    <HoverInteractWrapper scaleAmt={1.02}>
      <Card className="border border-slate-200/60 shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-shadow duration-500 bg-white/80 backdrop-blur-md rounded-xl overflow-hidden relative">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-csc-blue-light via-csc-blue-mid to-csc-blue-dark" />

        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-csc-blue-dark">
            <Sparkles className="w-5 h-5" />
            <CardTitle className="text-lg font-bold">AI Recommended Focus</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{recommendation.focusArea}</h3>
            <p className="text-slate-500 mt-1 leading-relaxed">{recommendation.reason}</p>
          </div>
          <div className="bg-slate-50/60 backdrop-blur-sm p-4 rounded-xl border border-slate-100/50">
            <p className="text-sm font-medium text-slate-600 flex items-start gap-2">
              <span className="text-csc-blue-dark font-bold">Action:</span>
              {recommendation.actionableStep}
            </p>
          </div>

          {/* Empathetic Error feedback */}
          {error && (
            <p className="text-sm text-rose-600 bg-rose-50/60 backdrop-blur-sm border border-rose-100/50 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter>
          <Button
            id="practice-weak-areas-btn"
            onClick={handlePracticeWeakAreas}
            disabled={isGenerating}
            className="w-full bg-csc-yellow/90 hover:bg-csc-yellow text-slate-900 font-bold shadow-sm hover:shadow text-md h-12 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating target quiz...
              </>
            ) : (
              <>
                Practice Weak Areas
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </HoverInteractWrapper>
  );
}
