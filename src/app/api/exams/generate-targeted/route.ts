import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Utility: Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Transform the flat question record into the shape the UI expects
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

export async function POST() {
  try {
    // 1. Verify user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const QUESTION_LIMIT = 15;

    // 2. Find the user's weakest topics (most recent mastery records that are
    //    PRIORITY_REVIEW, one per subject+topic pair)
    const weakMasteries = await prisma.topicMastery.findMany({
      where: {
        userId,
        masteryLevel: 'PRIORITY_REVIEW',
      },
      orderBy: { percentage: 'asc' },
      distinct: ['subject', 'topic'],
      take: 10, // Consider up to 10 distinct weak topics
    });

    let questions: Awaited<ReturnType<typeof prisma.question.findMany>>;

    if (weakMasteries.length === 0) {
      // 3a. Fallback for brand new users: pull a random QUICK_PRACTICE mix.
      const allIds = await prisma.question.findMany({
        where: { status: 'VERIFIED' },
        select: { id: true },
      });

      const sampledIds = shuffle(allIds)
        .slice(0, QUESTION_LIMIT)
        .map((q) => q.id);

      questions = await prisma.question.findMany({
        where: { id: { in: sampledIds } },
      });

      // Create session as QUICK_PRACTICE
      const testSession = await prisma.testSession.create({
        data: {
          userId,
          type: 'QUICK_PRACTICE',
          questionIds: questions.map((q) => q.id),
        },
      });

      return NextResponse.json({
        sessionId: testSession.id,
        type: 'QUICK_PRACTICE',
        questionBank: questions.map(sanitizeQuestion),
      });
    }

    // 3b. Map weak topics into question queries
    const orConditions = weakMasteries.map((wm) => ({
      subject: wm.subject,
      topic: wm.topic,
    }));

    const allIds = await prisma.question.findMany({
      where: {
        status: 'VERIFIED',
        OR: orConditions,
      },
      select: { id: true },
    });

    const sampledIds = shuffle(allIds)
      .slice(0, QUESTION_LIMIT)
      .map((q) => q.id);

    let selectedQuestions = await prisma.question.findMany({
      where: { id: { in: sampledIds } },
    });

    // 4. Create a TestSession record in Postgres
    const testSession = await prisma.testSession.create({
      data: {
        userId,
        type: 'WEAKNESS_REVIEW',
        questionIds: selectedQuestions.map((q) => q.id),
      },
    });

    // 5. Return sessionId + questions to the client
    return NextResponse.json({
      sessionId: testSession.id,
      type: 'WEAKNESS_REVIEW',
      questionBank: selectedQuestions.map(sanitizeQuestion),
    });
  } catch (error) {
    console.error('[generate-targeted] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate targeted quiz.' },
      { status: 500 }
    );
  }
}
