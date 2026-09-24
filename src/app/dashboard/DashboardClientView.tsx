"use client";

import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { PerformanceSummary } from "@/components/dashboard/PerformanceSummary";
import { SubjectMasteryList, SubjectMastery } from "@/components/dashboard/SubjectMasteryList";
import { AIActionCard } from "@/components/dashboard/AIActionCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardClientViewProps {
  userData: {
    name: string;
    examLevel: string;
    targetDate: string;
  };
  metrics: {
    averageScore: number;
    testsCompleted: number;
    studyStreak: number;
  };
  masteries: SubjectMastery[];
  aiRecommendation: {
    focusArea: string;
    reason: string;
    actionableStep: string;
  };
}

export function DashboardClientView({ userData, metrics, masteries, aiRecommendation }: DashboardClientViewProps) {
  return (
    <div className="min-h-screen bg-csc-blue-light/30">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <WelcomeHeader 
          userName={userData.name} 
          examLevel={userData.examLevel} 
          targetDate={userData.targetDate} 
        />
        
        <PerformanceSummary 
          averageScore={metrics.averageScore}
          testsCompleted={metrics.testsCompleted}
          studyStreak={metrics.studyStreak}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SubjectMasteryList masteries={masteries} />
          </div>
          <div className="space-y-6">
            <AIActionCard recommendation={aiRecommendation} />
            
            {/* Quick Action to take a new full exam */}
            <div className="bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm text-center">
              <h3 className="text-lg font-bold text-csc-blue-dark mb-2">Ready for a challenge?</h3>
              <p className="text-slate-600 text-sm mb-4">Take a full mock exam to gauge your readiness.</p>
              <Link href="/test-center/exam/new">
                <Button className="w-full bg-csc-blue-dark text-white hover:bg-csc-blue-dark/90 shadow-sm h-11">
                  Take Mock Exam
                </Button>
              </Link>
            </div>

            {/* Mistake Notebook shortcut */}
            <div className="bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm text-center">
              <h3 className="text-lg font-bold text-csc-blue-dark mb-2">Review Your Mistakes</h3>
              <p className="text-slate-600 text-sm mb-4">Study every question you got wrong, grouped by topic.</p>
              <Link href="/dashboard/mistakes">
                <Button variant="outline" className="w-full border-csc-blue-mid text-csc-blue-dark hover:bg-csc-blue-light/40 shadow-sm h-11">
                  Open Mistake Notebook
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
