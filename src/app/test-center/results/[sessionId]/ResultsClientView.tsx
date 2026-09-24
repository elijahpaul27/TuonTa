"use client";

import { ExamPerformanceResult } from "@/lib/scoring";
import { PersonalizedReviewerOutput } from "@/lib/ai/prompts";
import { ScoreOverview } from "@/components/results/ScoreOverview";
import { AIReviewerDisplay } from "@/components/results/AIReviewerDisplay";
import { PDFExportButton } from "@/components/results/PDFExportButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResultsClientViewProps {
  sessionId: string;
  performance: ExamPerformanceResult;
  reviewer: PersonalizedReviewerOutput | null;
}

export function ResultsClientView({ sessionId, performance, reviewer }: ResultsClientViewProps) {
  return (
    <div className="min-h-screen bg-csc-blue-light/30">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-csc-blue-dark">Your Exam Results</h1>
            <p className="text-slate-600 mt-1">Session: {sessionId}</p>
          </div>
          {reviewer && <PDFExportButton reviewer={reviewer} performance={performance} />}
        </div>

        <Tabs defaultValue="score" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-white border border-csc-blue-mid/30 shadow-sm p-1">
            <TabsTrigger 
              value="score" 
              className="data-[state=active]:bg-csc-blue-dark data-[state=active]:text-white text-slate-600 font-semibold"
            >
              Score Breakdown
            </TabsTrigger>
            <TabsTrigger 
              value="guide"
              className="data-[state=active]:bg-csc-blue-dark data-[state=active]:text-white text-slate-600 font-semibold"
            >
              AI Study Guide
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="score" className="mt-0">
            <ScoreOverview performance={performance} />
          </TabsContent>
          
          <TabsContent value="guide" className="mt-0">
            <AIReviewerDisplay reviewer={reviewer} sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
