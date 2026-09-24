"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { ExamPerformanceResult } from "@/lib/scoring";
import { Progress } from "@/components/ui/progress";
import { EngagementMessage } from "@/components/ui/EngagementMessage";

export function ScoreOverview({ performance }: { performance: ExamPerformanceResult }) {
  useEffect(() => {
    if (performance.passed) {
      confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 } 
      });
    }
  }, [performance.passed]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-csc-blue-dark">Overall Score</h2>
          <p className="text-slate-600">Based on your recent mock exam</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <span className="text-4xl font-extrabold text-slate-800">
            {performance.overallScore.toFixed(1)}%
          </span>
          <span className={`px-4 py-2 rounded-full font-bold text-sm ${
            performance.passed 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {performance.passed ? "PASSED" : "FAILED"}
          </span>
        </div>
      </div>

      <EngagementMessage type={performance.passed ? "quote" : "comfort"} />

      <div className="bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm">
        <h3 className="text-xl font-bold text-csc-blue-dark mb-6">Topic Mastery Breakdown</h3>
        <div className="space-y-6">
          {performance.topicPerformance.map((topic, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-semibold text-slate-800">{topic.subject} &gt; {topic.topic}</p>
                  <p className="text-sm text-slate-500">Mastery: <span className="font-medium text-csc-blue-dark">{topic.masteryStatus.replace('_', ' ')}</span></p>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {topic.correctCount} / {topic.totalCount} ({topic.percentage.toFixed(0)}%)
                </p>
              </div>
              <Progress value={topic.percentage} className="h-2 bg-csc-blue-light/30 text-csc-blue-dark" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
