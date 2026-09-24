import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MistakeCard, MistakeEntry } from "./MistakeCard";
import { AlertCircle } from "lucide-react";

interface TopicMistakeListProps {
  topic: string;
  mistakes: MistakeEntry[];
  // The accordion value key passed in so the parent can control open state
  accordionValue: string;
}

export function TopicMistakeList({ topic, mistakes, accordionValue }: TopicMistakeListProps) {
  return (
    <AccordionItem
      value={accordionValue}
      className="border border-csc-blue-mid/40 rounded-xl overflow-hidden bg-white shadow-sm data-[state=open]:shadow-md transition-shadow"
    >
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-csc-blue-light/20 transition-colors [&[data-state=open]]:bg-csc-blue-light/30">
        <div className="flex items-center gap-3 text-left">
          <AlertCircle className="w-4 h-4 text-csc-blue-dark flex-none" />
          <span className="font-semibold text-csc-blue-dark">{topic}</span>
          <Badge className="bg-red-100 text-red-700 border-red-200 border font-semibold hover:bg-red-100">
            {mistakes.length} {mistakes.length === 1 ? "mistake" : "mistakes"}
          </Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-5 pb-5 pt-2 space-y-4 bg-slate-50/50">
        {mistakes.map((mistake, idx) => (
          <MistakeCard key={mistake.attemptId} mistake={mistake} index={idx} />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
