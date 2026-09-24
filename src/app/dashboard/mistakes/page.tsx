import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MistakeNotebookClient } from "@/components/mistakes/MistakeNotebookClient";
import { MistakeEntry, QuestionOption } from "@/components/mistakes/MistakeCard";
import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RawMistakeAttempt = Prisma.QuestionAttemptGetPayload<{
  include: {
    Question: {
      select: {
        id: true,
        subject: true,
        topic: true,
        questionText: true,
        options: true,
        correctAnswer: true,
        explanation: true,
      };
    };
  };
}>;

export interface SerializedGroupedSubject {
  subject: string;
  totalMistakes: number;
  topics: {
    topic: string;
    mistakes: MistakeEntry[];
  }[];
}

// ── Data helpers ──────────────────────────────────────────────────────────────

/**
 * Safely parse the `options` field from Prisma (stored as Json).
 * It comes back as a parsed object in JS, but we guard for string just in case.
 */
function parseOptions(raw: unknown): QuestionOption[] {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as QuestionOption[];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw as QuestionOption[];
  return [];
}

/**
 * Groups a flat list of attempts into Subject → Topic → Mistakes[].
 * Groups by question.id to consolidate duplicates, calculating attemptCount.
 * Subjects and topics are sorted alphabetically; mistakes sorted newest-first.
 */
function groupAttemptsBySubjectAndTopic(
  attempts: RawMistakeAttempt[]
): SerializedGroupedSubject[] {
  const map = new Map<string, Map<string, Map<string, MistakeEntry>>>();

  for (const attempt of attempts) {
    if (!attempt.Question) continue;

    const { subject, topic, id: questionId } = attempt.Question;

    if (!map.has(subject)) map.set(subject, new Map());
    const topicMap = map.get(subject)!;

    if (!topicMap.has(topic)) topicMap.set(topic, new Map());
    const questionMap = topicMap.get(topic)!;

    if (questionMap.has(questionId)) {
      const existing = questionMap.get(questionId)!;
      existing.attemptCount += 1;
    } else {
      questionMap.set(questionId, {
        attemptId: attempt.id,
        userAnswer: attempt.userAnswer,
        attemptedAt: attempt.createdAt.toISOString(),
        attemptCount: 1,
        latestAttemptDate: attempt.createdAt.toISOString(),
        question: {
          id: attempt.Question.id,
          subject: attempt.Question.subject,
          topic: attempt.Question.topic,
          questionText: attempt.Question.questionText,
          options: parseOptions(attempt.Question.options),
          correctAnswer: attempt.Question.correctAnswer,
          explanation: attempt.Question.explanation,
        },
      });
    }
  }

  // Build sorted output
  const result: SerializedGroupedSubject[] = [];
  const sortedSubjects = Array.from(map.keys()).sort();

  for (const subject of sortedSubjects) {
    const topicMap = map.get(subject)!;
    const sortedTopics = Array.from(topicMap.keys()).sort();

    const topics = sortedTopics.map((topic) => {
      const questionMap = topicMap.get(topic)!;
      const mistakes = Array.from(questionMap.values()).sort(
        (a, b) => new Date(b.latestAttemptDate).getTime() - new Date(a.latestAttemptDate).getTime()
      );
      return { topic, mistakes };
    });

    result.push({
      subject,
      totalMistakes: topics.reduce((sum, t) => sum + t.mistakes.length, 0),
      topics,
    });
  }

  return result;
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchMistakes(userId: string): Promise<RawMistakeAttempt[]> {
  return prisma.questionAttempt.findMany({
    where: {
      userId,
      isCorrect: false,
    },
    include: {
      Question: {
        select: {
          id: true,
          subject: true,
          topic: true,
          questionText: true,
          options: true,
          correctAnswer: true,
          explanation: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Mistake Notebook | CSC Reviewer",
  description: "Review every question you answered incorrectly, grouped by subject and topic.",
};

export default async function MistakesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rawAttempts = await fetchMistakes(session.user.id);
  const grouped = groupAttemptsBySubjectAndTopic(rawAttempts);

  return (
    <div className="min-h-screen bg-csc-blue-light/30">
      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12 space-y-8">

        {/* Page header */}
        <div className="bg-white border border-csc-blue-mid/40 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-csc-blue-light flex items-center justify-center flex-none">
              <BookOpenCheck className="w-6 h-6 text-csc-blue-dark" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-csc-blue-dark">Mistake Notebook</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Every question you got wrong — study the explanations to level up.
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-csc-blue-mid text-csc-blue-dark hover:bg-csc-blue-light/40">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Main content */}
        <MistakeNotebookClient grouped={grouped} />
      </div>
    </div>
  );
}
