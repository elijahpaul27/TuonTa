import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface SubjectMastery {
  subject: string;
  percentage: number;
  status: 'MASTERED' | 'STRONG' | 'NEEDS_IMPROVEMENT' | 'PRIORITY_REVIEW';
}

interface SubjectMasteryListProps {
  masteries: SubjectMastery[];
}

import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";

export function SubjectMasteryList({ masteries }: SubjectMasteryListProps) {
  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MASTERED': return 'text-green-600';
      case 'STRONG': return 'text-blue-600';
      case 'NEEDS_IMPROVEMENT': return 'text-orange-500';
      case 'PRIORITY_REVIEW': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <HoverInteractWrapper scaleAmt={1.02}>
      <Card className="!bg-white/70 !backdrop-blur-md border border-slate-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-csc-blue-dark">Subject Mastery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {masteries.map((mastery, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-semibold text-slate-800">{mastery.subject}</span>
                <span className={`text-sm font-bold ${getStatusColor(mastery.status)}`}>
                  {formatStatus(mastery.status)} ({mastery.percentage.toFixed(0)}%)
                </span>
              </div>
              {/* The text-csc-blue-dark class is used assuming the Progress indicator color is mapped to text/current color. Alternatively, standard tailwind overrides can apply. */}
              <Progress value={mastery.percentage} className="h-2.5 bg-csc-blue-light/30 text-csc-blue-dark" />
            </div>
          ))}
        </CardContent>
      </Card>
    </HoverInteractWrapper>
  );
}
