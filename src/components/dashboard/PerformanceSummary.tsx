import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, Flame } from "lucide-react";

interface PerformanceSummaryProps {
  averageScore: number;
  testsCompleted: number;
  studyStreak: number;
}

import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";

export function PerformanceSummary({ averageScore, testsCompleted, studyStreak }: PerformanceSummaryProps) {
  const metrics = [
    {
      title: "Average Score",
      value: `${averageScore.toFixed(1)}%`,
      icon: <Target className="w-5 h-5 text-csc-blue-dark" />,
      description: "Across all mock exams"
    },
    {
      title: "Tests Completed",
      value: testsCompleted.toString(),
      icon: <Activity className="w-5 h-5 text-csc-blue-dark" />,
      description: "Total exams taken"
    },
    {
      title: "Study Streak",
      value: `${studyStreak} Days`,
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      description: "Keep it up!"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {metrics.map((metric, index) => (
        <HoverInteractWrapper key={index} scaleAmt={1.02}>
          <Card className="!bg-white/70 !backdrop-blur-md border-slate-200/60 shadow-sm w-full h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {metric.title}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-csc-blue-dark">{metric.value}</div>
              <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        </HoverInteractWrapper>
      ))}
    </div>
  );
}
