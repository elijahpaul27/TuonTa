import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { evaluateExamPerformance, Question } from '@/lib/scoring';
import { generateReviewerPrompt, PersonalizedReviewerOutput } from '@/lib/ai/prompts';
import Groq from 'groq-sdk';

import { z } from 'zod';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PersonalizedReviewerSchema = z.object({
  overview: z.string(),
  keyConcepts: z.array(z.string()),
  practiceQuestions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.string(),
      explanation: z.string(),
    })
  ),
  recommendedTopics: z.array(z.string()),
});

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;

    // 1. Load the TestSession
    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!testSession || testSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Test session not found or unauthorized.' }, { status: 404 });
    }

    if (!testSession.completedAt) {
      return NextResponse.json({ error: 'Exam has not been submitted yet.' }, { status: 400 });
    }

    // 2. Reload questions and re-compute performance
    const questionIds = testSession.questionIds as string[];
    const userAnswers = (testSession.answers as Record<string, string>) || {};

    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, subject: true, topic: true, correctAnswer: true },
    });

    const questionBank: Question[] = dbQuestions.map((q) => ({
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      correctAnswer: q.correctAnswer,
    }));

    const performanceResult = evaluateExamPerformance(userAnswers, questionBank);

    // 3. Generate AI Reviewer via Groq
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
    if (!aiReviewerText) {
      return NextResponse.json({ error: 'Groq returned an empty response.' }, { status: 502 });
    }

    // Attempt JSON parse
    let parsedData;
    try {
      parsedData = JSON.parse(aiReviewerText);
    } catch (parseError) {
      console.error('[retry-ai] JSON Parsing Error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON returned from AI.' }, { status: 500 });
    }

    // Validate structure with Zod
    const rawReviewer = parsedData.reviewer || parsedData;
    let reviewer: z.infer<typeof PersonalizedReviewerSchema>;
    try {
      reviewer = PersonalizedReviewerSchema.parse(rawReviewer);
    } catch (zodError) {
      console.error('[retry-ai] Zod Schema Validation Error:', zodError);
      return NextResponse.json({ error: 'AI hallucinated invalid structure. Please retry.' }, { status: 500 });
    }

    // 4. Persist the AI reviewer to the TestSession
    await prisma.testSession.update({
      where: { id: sessionId },
      data: { aiAnalysis: JSON.parse(JSON.stringify(reviewer)) },
    });

    return NextResponse.json({ success: true, reviewer });
  } catch (error) {
    console.error('[retry-ai] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI review. Please try again.' },
      { status: 500 }
    );
  }
}
