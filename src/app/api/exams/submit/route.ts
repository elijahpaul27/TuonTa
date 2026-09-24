import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { evaluateExamPerformance, Question, calculateSM2 } from '@/lib/scoring';
import { generateReviewerPrompt, PersonalizedReviewerOutput } from '@/lib/ai/prompts';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, answers } = body;

    if (!sessionId || !answers) {
      return NextResponse.json(
        { error: 'Missing sessionId or answers in the request payload.' },
        { status: 400 }
      );
    }

    // 1. Fetch the TestSession and its questions from the database
    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!testSession || testSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Test session not found or unauthorized.' }, { status: 404 });
    }

    const questionIds = testSession.questionIds as string[];
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, subject: true, topic: true, correctAnswer: true },
    });

    // 2. Deterministic Scoring — runs independently of AI
    const questionBank: Question[] = dbQuestions.map((q) => ({
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      correctAnswer: q.correctAnswer,
    }));

    const performanceResult = evaluateExamPerformance(answers, questionBank);

    // 3. Attempt AI Reviewer Generation (graceful degradation)
    let aiReviewerPayload: PersonalizedReviewerOutput | null = null;

    try {
      const retrievedContext = `
        CSC Context Materials:
        Topics covered in this exam session include: ${Array.from(new Set(dbQuestions.map(q => q.topic))).join(', ')}.
        Subjects: ${Array.from(new Set(dbQuestions.map(q => q.subject))).join(', ')}.
      `;

      const basePrompt = generateReviewerPrompt(performanceResult, retrievedContext);
      const prompt = `${basePrompt}\n\nReturn the result strictly as a JSON object containing a single key "reviewer" whose value is an object with the following keys:
- overview (string)
- keyConcepts (array of strings)
- practiceQuestions (array of objects with question, options array, correctAnswer, explanation)
- recommendedTopics (array of strings)`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: 'openai/gpt-oss-20b',
        response_format: { type: "json_object" },
      });

      const aiReviewerText = completion.choices[0]?.message?.content;
      if (aiReviewerText) {
        const parsedData = JSON.parse(aiReviewerText);
        aiReviewerPayload = parsedData.reviewer || parsedData;
      }
    } catch (aiError) {
      console.error('[submit] Groq AI generation failed — proceeding without AI reviewer:', aiError);
      // aiReviewerPayload remains null — graceful degradation
    }

    // 4. Save results to PostgreSQL — always runs, even if AI failed
    await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        answers: answers,
        overallScore: performanceResult.overallScore,
        passed: performanceResult.passed,
        aiReviewer: aiReviewerPayload ? JSON.parse(JSON.stringify(aiReviewerPayload)) : undefined,
        completedAt: new Date(),
      },
    });

    // 5. Save per-topic mastery records
    const masteryRecords = performanceResult.topicPerformance.map((tp) => ({
      userId: session.user.id,
      sessionId: sessionId,
      subject: tp.subject,
      topic: tp.topic,
      correctCount: tp.correctCount,
      totalCount: tp.totalCount,
      percentage: tp.percentage,
      masteryLevel: tp.masteryStatus,
    }));

    if (masteryRecords.length > 0) {
      await prisma.topicMastery.createMany({ data: masteryRecords });
    }

    // 6. Save individual question attempts with SM-2 logic
    const priorAttempts = await prisma.questionAttempt.findMany({
      where: {
        userId: session.user.id,
        questionId: { in: questionIds }
      },
      orderBy: { createdAt: 'desc' }
    });

    const latestPriorAttempts: Record<string, { repetitions: number; easeFactor: number; interval: number }> = {};
    for (const attempt of priorAttempts) {
      if (!latestPriorAttempts[attempt.questionId]) {
        latestPriorAttempts[attempt.questionId] = {
          repetitions: attempt.repetitions,
          easeFactor: attempt.easeFactor,
          interval: attempt.interval,
        };
      }
    }

    const attemptRecords = questionBank.map((q) => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      const prior = latestPriorAttempts[q.id];
      const sm2 = calculateSM2(isCorrect, prior);

      return {
        userId: session.user.id,
        sessionId: sessionId,
        questionId: q.id,
        userAnswer: answers[q.id] || '',
        isCorrect,
        repetitions: sm2.repetitions,
        easeFactor: sm2.easeFactor,
        interval: sm2.interval,
        nextReviewDate: sm2.nextReviewDate,
      };
    });

    if (attemptRecords.length > 0) {
      await prisma.questionAttempt.createMany({ data: attemptRecords });
    }

    // 7. Gamification: Award Badges
    const existingAchievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      select: { badgeName: true }
    });
    const earnedBadgeNames = new Set(existingAchievements.map(a => a.badgeName));

    const newAchievements = [];
    if (performanceResult.overallScore >= 90 && !earnedBadgeNames.has('Top Brass')) {
      newAchievements.push({ userId: session.user.id, badgeName: 'Top Brass', description: 'Scored 90%+ on an exam' });
    }
    if (performanceResult.overallScore >= 80 && !earnedBadgeNames.has('Civil Servant')) {
      newAchievements.push({ userId: session.user.id, badgeName: 'Civil Servant', description: 'Passed a mock exam (80%+)' });
    }
    if (!earnedBadgeNames.has('First Blood')) {
      newAchievements.push({ userId: session.user.id, badgeName: 'First Blood', description: 'Completed your first exam' });
    }

    if (newAchievements.length > 0) {
      await prisma.achievement.createMany({ data: newAchievements });
    }

    // 8. Return success with sessionId — client routes to results page
    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      performance: performanceResult,
      reviewer: aiReviewerPayload,
    });

  } catch (error) {
    console.error('Error processing exam submission:', error);
    return NextResponse.json(
      { error: 'An error occurred while evaluating the exam.' },
      { status: 500 }
    );
  }
}
