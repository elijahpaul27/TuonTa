"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/useExamStore";
import { useExamTimer } from "@/hooks/useExamTimer";
import { QuestionDisplay } from "@/components/exam/QuestionDisplay";
import { ExamSidebar } from "@/components/exam/ExamSidebar";
import { ExamControls } from "@/components/exam/ExamControls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { db, SerializedQuestion } from "@/lib/db";
import { Loader2 } from "lucide-react";

type RunnerQuestion = {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
};

function toRunnerQuestion(q: SerializedQuestion): RunnerQuestion {
  return {
    id: q.id,
    questionText: q.questionText,
    options: q.options,
  };
}

export function ExamClientRunner({ sessionId, initialQuestions = [] }: { sessionId: string; initialQuestions?: SerializedQuestion[] }) {
  const router = useRouter();
  const { startExam, setAnswer, answers, timeRemaining, syncFromOffline } = useExamStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  const [questions, setQuestions] = useState<RunnerQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize timer hook
  useExamTimer();

  useEffect(() => {
    const initExam = async () => {
      setIsLoading(true);
      // First try to sync existing state from Dexie
      await syncFromOffline(sessionId);

      // Load the question bank stored by AIActionCard (or the mock exam flow)
      const offlineRecord = await db.offlineSessions.get(sessionId);

      if (offlineRecord?.questionBank && offlineRecord.questionBank.length > 0) {
        setQuestions(offlineRecord.questionBank.map(toRunnerQuestion));
      } else if (initialQuestions.length > 0) {
        // Fallback to server-fetched questions and store them in Dexie for offline support
        const mappedQuestions = initialQuestions.map(toRunnerQuestion);
        setQuestions(mappedQuestions);
        
        await db.offlineSessions.put({
          sessionId,
          examLevel: 'FULL_EXAM',
          timeRemainingSecs: 7200, // 2 hours default
          answers: {},
          lastUpdated: Date.now(),
          syncStatus: "pending",
          questionBank: initialQuestions,
        });
      }

      const state = useExamStore.getState();
      if (!state.sessionId) {
        // Start fresh session: duration depends on exam type
        const duration = offlineRecord?.timeRemainingSecs ?? 7200;
        await startExam(sessionId, duration, offlineRecord?.answers ?? {});
      }

      setIsLoading(false);
    };

    initExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Auto-submission when timer hits 0
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmittingState && Object.keys(answers).length > 0) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  const handleAnswerChange = (answerId: string) => {
    if (!questions[currentIndex]) return;
    setAnswer(questions[currentIndex].id, answerId);
  };

  const handleSubmit = async () => {
    setIsSubmitDialogOpen(false);
    setIsSubmittingState(true);

    try {
      const response = await fetch("/api/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      });

      if (response.ok) {
        const data = await response.json();
        await db.offlineSessions.delete(sessionId);
        // Route to the real session ID returned by the server
        router.push(`/test-center/results/${data.sessionId || sessionId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Submission failed. Please try again.");
        setIsSubmittingState(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network error during submission. Your answers are saved offline — please try again.");
      setIsSubmittingState(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-csc-blue-light flex items-center justify-center flex-col gap-4 p-4">
        <Loader2 className="w-12 h-12 text-csc-blue-dark animate-spin" />
        <p className="text-slate-700 font-medium">Loading your exam...</p>
      </div>
    );
  }

  // ── Submission / grading state ────────────────────────────────────────────
  if (isSubmittingState) {
    return (
      <div className="min-h-screen bg-csc-blue-light flex items-center justify-center flex-col p-4">
        <div className="w-16 h-16 border-4 border-csc-blue-dark border-t-csc-yellow rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-slate-800">Grading and generating AI Reviewer...</h2>
        <p className="text-slate-600 mt-2">Please wait while we analyze your performance.</p>
      </div>
    );
  }

  // ── Empty question bank guard ─────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-csc-blue-light flex items-center justify-center flex-col gap-4 p-4 text-center">
        <h2 className="text-2xl font-bold text-csc-blue-dark">No questions found</h2>
        <p className="text-slate-600">
          There are no verified questions in the database yet. Ask an admin to upload and verify
          questions first.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-csc-blue-light/50 bg-gradient-to-b from-csc-blue-light/80 to-white pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Content Area */}
          <div className="flex-1 max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-csc-blue-dark mb-2">
                {questions.length === 15 ? "Targeted Practice Mode" : "Civil Service Mock Exam"}
              </h1>
              <p className="text-slate-600">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            <QuestionDisplay
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.id]}
              onAnswerChange={handleAnswerChange}
            />

            <ExamControls
              onPrevious={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              onNext={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              onSubmitClick={() => setIsSubmitDialogOpen(true)}
              hasPrevious={currentIndex > 0}
              hasNext={currentIndex < questions.length - 1}
            />
          </div>

          {/* Sidebar */}
          <ExamSidebar
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            timeRemaining={timeRemaining}
            onNavigate={setCurrentIndex}
          />
        </div>
      </div>

      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {Object.keys(answers).length} out of {questions.length} questions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reviewing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-csc-yellow text-slate-900 hover:brightness-95"
            >
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
