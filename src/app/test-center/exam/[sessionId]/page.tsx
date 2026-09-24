import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ExamClientRunner } from "./ExamClientRunner";

function sanitizeQuestion(q: any) {
  return {
    id: q.id,
    questionText: q.questionText,
    correctAnswer: q.correctAnswer,
    subject: q.subject,
    topic: q.topic,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
  };
}

export default async function ExamPage({ params }: { params: { sessionId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let testSessionId = params.sessionId;

  // Handle the static "new" route for full mock exams
  if (testSessionId === "new") {
    // Fetch random verified questions for a mock exam
    const QUESTION_LIMIT = 170; // Standard CSC exam length
    const allIds = await prisma.question.findMany({
      where: { status: 'VERIFIED' },
      select: { id: true },
    });

    // Shuffle and pick
    const shuffled = [...allIds].sort(() => Math.random() - 0.5).slice(0, QUESTION_LIMIT);
    const sampledIds = shuffled.map(q => q.id);

    const newSession = await prisma.testSession.create({
      data: {
        userId: session.user.id,
        type: 'FULL_EXAM',
        questionIds: sampledIds,
      },
    });

    // Redirect to the newly created session
    redirect(`/test-center/exam/${newSession.id}`);
  }

  // 1. Query the TestSession
  const testSession = await prisma.testSession.findUnique({
    where: { id: testSessionId },
  });

  if (!testSession || testSession.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // 2. Query the Question table accurately using the updated schema
  // Ensure we maintain the order of questions if possible, or just fetch them all
  const rawQuestions = await prisma.question.findMany({
    where: { 
      id: { in: testSession.questionIds as string[] }
    }
  });

  const questions = rawQuestions.map(sanitizeQuestion);

  return <ExamClientRunner sessionId={testSessionId} initialQuestions={questions} />;
}


