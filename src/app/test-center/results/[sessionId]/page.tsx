import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExamPerformanceResult, TopicPerformance, MasteryStatus } from "@/lib/scoring";
import { PersonalizedReviewerOutput } from "@/lib/ai/prompts";
import { ResultsClientView } from "./ResultsClientView";

export default async function ResultsPage({ params }: { params: { sessionId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const testSession = await prisma.testSession.findUnique({
    where: { id: params.sessionId },
  });

  if (!testSession || testSession.userId !== session.user.id || !testSession.completedAt) {
    redirect("/dashboard");
  }

  // Reconstruct the performance result from the stored fields
  // Fetch the topic mastery records for this session
  const masteryRecords = await prisma.topicMastery.findMany({
    where: { sessionId: params.sessionId },
  });

  const topicPerformance: TopicPerformance[] = masteryRecords.map((m) => ({
    subject: m.subject,
    topic: m.topic,
    correctCount: m.correctCount,
    totalCount: m.totalCount,
    percentage: m.percentage,
    masteryStatus: m.masteryLevel as MasteryStatus,
  }));

  const performance: ExamPerformanceResult = {
    overallScore: testSession.overallScore ?? 0,
    passed: testSession.passed ?? false,
    topicPerformance,
  };

  // The aiAnalysis column may be null if Groq failed during submission
  const reviewer: PersonalizedReviewerOutput | null = testSession.aiAnalysis
    ? (testSession.aiAnalysis as unknown as PersonalizedReviewerOutput)
    : null;

  return (
    <ResultsClientView 
      sessionId={params.sessionId} 
      performance={performance} 
      reviewer={reviewer} 
    />
  );
}
