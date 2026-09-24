"use client";

import { useState } from "react";
import { XCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";
import { AnimatePresence, motion } from "framer-motion";
import { AITutorChat } from "./AITutorChat";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  text: string;
}

export interface MistakeEntry {
  attemptId: string;
  userAnswer: string;
  attemptedAt: string; // ISO string
  attemptCount: number;
  latestAttemptDate: string;
  question: {
    id: string;
    subject: string;
    topic: string;
    questionText: string;
    options: QuestionOption[];
    correctAnswer: string;
    explanation: string | null;
  };
}

interface MistakeCardProps {
  mistake: MistakeEntry;
  index: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOptionText(options: QuestionOption[], id: string): string {
  return options.find((o) => o.id === id)?.text ?? id;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MistakeCard({ mistake, index }: MistakeCardProps) {
  const { question, userAnswer, attemptCount } = mistake;
  const options = question.options;

  const [isChatOpen, setIsChatOpen] = useState(false);

  const userAnswerText = getOptionText(options, userAnswer);
  const correctAnswerText = getOptionText(options, question.correctAnswer);

  return (
    <HoverInteractWrapper scaleAmt={1.02}>
      <Card className="!bg-white/70 !backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {attemptCount > 1 && (
          <div className="bg-csc-yellow/80 text-slate-900 px-4 py-2 text-sm font-semibold flex items-center gap-2 border-b border-csc-yellow">
            <span>⚠️</span>
            You have answered this question incorrectly {attemptCount} times.
          </div>
        )}
        <CardContent className="pt-5 pb-5 space-y-4">
          {/* Question number + text */}
          <div className="flex items-start gap-3">
            <span className="flex-none mt-0.5 w-7 h-7 rounded-full bg-csc-blue-light text-csc-blue-dark text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">{question.questionText}</p>
          </div>

          {/* Answer comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
            {/* User's wrong answer */}
            <div className="flex items-start gap-2 bg-red-50/70 border border-red-200/50 rounded-lg p-3">
              <XCircle className="w-4 h-4 text-red-500 flex-none mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-0.5">
                  Your Answer
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-red-700 mr-1">{userAnswer}.</span>
                  {userAnswerText}
                </p>
              </div>
            </div>

            {/* Correct answer */}
            <div className="flex items-start gap-2 bg-emerald-50/70 border border-emerald-200/50 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-0.5">
                  Correct Answer
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-emerald-700 mr-1">{question.correctAnswer}.</span>
                  {correctAnswerText}
                </p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="pl-10">
              <div className="bg-csc-blue-light/30 border border-csc-blue-mid/40 rounded-lg p-3">
                <p className="text-xs font-semibold text-csc-blue-dark uppercase tracking-wide mb-1">
                  Explanation
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          )}

          {/* Need a Quick Review? */}
          <div className="pl-10 pt-2 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/60 border border-csc-blue-light/50 p-4 rounded-xl gap-4">
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-2">
                  <span>📚</span> Need a Quick Review?
                </p>
                <p className="text-xs text-slate-500 mt-1">Visit Study Hall for a crash course on this concept.</p>
              </div>
              <HoverInteractWrapper scaleAmt={1.05} className="w-auto">
                <Button
                  asChild
                  className="bg-csc-blue-dark hover:bg-csc-blue-dark/90 text-white shadow-sm whitespace-nowrap"
                >
                  <a href={`/resources?topic=${encodeURIComponent(question.topic)}`}>
                    Review {question.topic} in Study Hall
                  </a>
                </Button>
              </HoverInteractWrapper>
            </div>
          </div>

          {/* Actions & Meta */}
          <div className="pl-10 flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <Badge
              variant="outline"
              className="text-xs text-slate-400 border-slate-200 font-normal"
            >
              Attempted{" "}
              {new Date(mistake.attemptedAt).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Badge>

            <HoverInteractWrapper scaleAmt={1.05} className="w-auto">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 border-csc-blue-mid/50 text-csc-blue-dark transition-colors ${
                  isChatOpen ? "bg-csc-blue-light/50" : "hover:bg-csc-blue-light/30 bg-white/50"
                }`}
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                <MessageCircle className="w-4 h-4" />
                Ask AI Tutor
              </Button>
            </HoverInteractWrapper>
          </div>
        </CardContent>

        {/* AI Chat Accordion */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AITutorChat
                questionId={question.id}
                questionText={question.questionText}
                userAnswer={userAnswerText}
                correctAnswer={correctAnswerText}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </HoverInteractWrapper>
  );
}
