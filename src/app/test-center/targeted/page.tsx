import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function TargetedPracticeOrchestrator() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 1. Fetch Priority Topics
  const weakMasteries = await prisma.topicMastery.findMany({
    where: {
      userId,
      masteryLevel: "PRIORITY_REVIEW",
    },
    orderBy: { percentage: "asc" },
    distinct: ["subject", "topic"],
  });

  const priorityTopics = weakMasteries.map((m) => m.topic);

  // 2. Fetch Overdue SM-2 Questions
  const now = new Date();
  const dueAttempts = await prisma.questionAttempt.findMany({
    where: {
      userId,
      nextReviewDate: { lte: now },
    },
    select: { questionId: true },
  });
  
  const dueQuestionIds = dueAttempts.map(a => a.questionId);

  // 3. If everything is caught up, show the empty state
  if (priorityTopics.length === 0 && dueQuestionIds.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 pt-24 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">You&apos;re all caught up!</h1>
          <p className="text-slate-600 mb-6">
            No priority review topics or pending SM-2 questions found. Keep up the great work!
          </p>
          <Link href="/dashboard">
            <Button className="w-full bg-csc-blue-dark hover:bg-csc-blue-dark/90 text-white">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // 4. Generate the targeted test bank
  let testBankIds = new Set<string>();

  // Add all overdue questions first (they take priority for memory retention)
  dueQuestionIds.forEach(id => testBankIds.add(id));

  // If we still need questions to reach 15, fetch from weak topics
  if (testBankIds.size < 15 && priorityTopics.length > 0) {
    const topicQuestions = await prisma.question.findMany({
      where: {
        status: "VERIFIED",
        topic: { in: priorityTopics }
      },
      select: { id: true }
    });

    // Shuffle the topic questions to add variety
    const shuffledTopicQuestions = shuffle(topicQuestions);

    for (const q of shuffledTopicQuestions) {
      testBankIds.add(q.id);
      if (testBankIds.size >= 15) break;
    }
  }

  // Convert Set to Array and enforce a max of 15 questions
  const finalQuestionIds = Array.from(testBankIds).slice(0, 15);

  // 5. Create Test Session
  const testSession = await prisma.testSession.create({
    data: {
      userId,
      type: "WEAKNESS_REVIEW",
      questionIds: finalQuestionIds,
    },
  });

  // 6. Push user into the exam
  redirect(`/test-center/exam/${testSession.id}`);
}
