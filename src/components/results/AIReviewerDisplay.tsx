"use client";

import { useState } from "react";
import { PersonalizedReviewerOutput } from "@/lib/ai/prompts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { PDFExportButton } from "@/components/pdf/PDFExportButton";

interface AIReviewerDisplayProps {
  reviewer: PersonalizedReviewerOutput | null;
  sessionId: string;
}

export function AIReviewerDisplay({ reviewer: initialReviewer, sessionId }: AIReviewerDisplayProps) {
  const [reviewer, setReviewer] = useState<PersonalizedReviewerOutput | null>(initialReviewer);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryError(null);
    try {
      const response = await fetch(`/api/exams/${sessionId}/retry-ai`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setReviewer(data.reviewer);
      } else {
        const errData = await response.json().catch(() => ({}));
        setRetryError(errData.error || 'Failed to generate AI review.');
      }
    } catch (err) {
      setRetryError('Network error. Please check your connection.');
    } finally {
      setIsRetrying(false);
    }
  };

  // ── Fallback: AI not available ──────────────────────────────────────────
  if (!reviewer) {
    return (
      <div className="bg-white p-8 rounded-xl border border-csc-blue-mid/30 shadow-sm text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="w-12 h-12 text-csc-yellow" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">AI Analysis Temporarily Unavailable</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Your score has been saved successfully, but the AI-powered study guide could not be generated at this time.
          You can retry the analysis below.
        </p>
        {retryError && (
          <p className="text-red-600 text-sm font-medium">{retryError}</p>
        )}
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="bg-csc-blue-dark text-white hover:bg-csc-blue-dark/90 font-semibold"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry AI Analysis
            </>
          )}
        </Button>
      </div>
    );
  }

  // ── Normal: Full AI reviewer display ────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex justify-end mb-4">
        <PDFExportButton payload={reviewer} />
      </div>

      {/* Overview */}
      <div className="bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm">
        <h3 className="text-xl font-bold text-csc-blue-dark mb-4">Performance Overview</h3>
        <p className="text-slate-700 leading-relaxed text-lg">{reviewer.overview}</p>
      </div>

      {/* Key Concepts */}
      <div className="bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm">
        <h3 className="text-xl font-bold text-csc-blue-dark mb-4">Key Concepts to Review</h3>
        <ul className="list-disc pl-5 space-y-3">
          {reviewer.keyConcepts.map((concept, idx) => (
            <li key={idx} className="text-slate-700 text-lg">{concept}</li>
          ))}
        </ul>
      </div>

      {/* Practice Questions */}
      <div className="bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm">
        <h3 className="text-xl font-bold text-csc-blue-dark mb-4">Targeted Practice Questions</h3>
        <Accordion type="single" collapsible className="w-full">
          {reviewer.practiceQuestions.map((pq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-csc-blue-mid/30">
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-csc-blue-dark">
                {idx + 1}. {pq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-700 space-y-4 pt-2">
                <ul className="space-y-2 mb-4">
                  {pq.options.map((opt, oIdx) => (
                    <li key={oIdx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">{opt}</li>
                  ))}
                </ul>
                <div className="bg-csc-yellow/20 p-4 rounded-lg border border-csc-yellow/50">
                  <p className="font-bold text-slate-900 mb-2">Correct Answer: {pq.correctAnswer}</p>
                  <p className="text-slate-800">{pq.explanation}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Recommended Topics */}
      <div className="bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm">
        <h3 className="text-xl font-bold text-csc-blue-dark mb-4">Recommended Next Steps</h3>
        <div className="flex flex-wrap gap-2">
          {reviewer.recommendedTopics.map((topic, idx) => (
            <span key={idx} className="px-4 py-2 bg-csc-blue-light/50 text-csc-blue-dark font-semibold rounded-full border border-csc-blue-mid">
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
