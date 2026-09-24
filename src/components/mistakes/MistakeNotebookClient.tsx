"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { TopicMistakeList } from "./TopicMistakeList";
import { MistakeEntry } from "./MistakeCard";
import { BookOpen, Trophy } from "lucide-react";
import { EngagementMessage } from "@/components/ui/EngagementMessage";

// ── Types ─────────────────────────────────────────────────────────────────────

import { SerializedGroupedSubject } from "@/app/dashboard/mistakes/page";

interface MistakeNotebookClientProps {
  grouped: SerializedGroupedSubject[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MistakeNotebookClient({ grouped }: MistakeNotebookClientProps) {
  // Default all accordion items open within each subject tab
  const [openItems, setOpenItems] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      grouped.map((g) => [
        g.subject,
        g.topics.map((_, i) => `${g.subject}-topic-${i}`),
      ])
    )
  );

  // ── Empty state ──────────────────────────────────────────────────────────
  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-csc-blue-light flex items-center justify-center">
          <Trophy className="w-10 h-10 text-csc-blue-dark" />
        </div>
        <h2 className="text-2xl font-bold text-csc-blue-dark">No mistakes yet!</h2>
        <p className="text-slate-500 max-w-sm leading-relaxed mb-4">
          You haven&apos;t answered any questions incorrectly — or you haven&apos;t taken an exam yet.
          Keep practicing to build your Mistake Notebook.
        </p>
        <EngagementMessage type="quote" className="max-w-md mx-auto" />
      </div>
    );
  }

  const totalMistakes = grouped.reduce((sum, g) => sum + g.totalMistakes, 0);

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="flex items-center gap-3 bg-white border border-csc-blue-mid/40 rounded-xl px-5 py-4 shadow-sm">
        <BookOpen className="w-5 h-5 text-csc-blue-dark flex-none" />
        <p className="text-slate-700">
          You have{" "}
          <span className="font-bold text-red-600">{totalMistakes} incorrect answer{totalMistakes !== 1 ? "s" : ""}</span>{" "}
          across{" "}
          <span className="font-bold text-csc-blue-dark">{grouped.length} subject{grouped.length !== 1 ? "s" : ""}</span>.
          Study each explanation carefully to improve your score.
        </p>
      </div>

      {/* Subject tabs */}
      <Tabs defaultValue={grouped[0].subject}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-csc-blue-light/40 p-1 rounded-xl">
          {grouped.map((g) => (
            <TabsTrigger
              key={g.subject}
              value={g.subject}
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-csc-blue-dark data-[state=active]:shadow-sm font-medium"
            >
              {g.subject}
              <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {g.totalMistakes}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {grouped.map((g) => (
          <TabsContent key={g.subject} value={g.subject} className="mt-4">
            <Accordion
              type="multiple"
              value={openItems[g.subject] ?? []}
              onValueChange={(val) =>
                setOpenItems((prev) => ({ ...prev, [g.subject]: val }))
              }
              className="space-y-3"
            >
              {g.topics.map((t, idx) => (
                <TopicMistakeList
                  key={`${g.subject}-${t.topic}`}
                  topic={t.topic}
                  mistakes={t.mistakes}
                  accordionValue={`${g.subject}-topic-${idx}`}
                />
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
