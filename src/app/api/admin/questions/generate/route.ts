import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GeneratedQuestionSchema = z.object({
  questions: z.array(
    z.object({
      topic: z.string(),
      difficulty: z.string(),
      questionText: z.string(),
      options: z.array(
        z.object({
          id: z.string(),
          text: z.string()
        })
      ).length(4),
      correctAnswer: z.string(),
      explanation: z.string()
    })
  ).length(5)
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { level, subject } = await request.json();
    if (!level || !subject) {
      return NextResponse.json({ error: 'Level and subject are required.' }, { status: 400 });
    }

    const prompt = `Generate exactly 5 multiple-choice questions for the Philippine Civil Service Exam (${level} level).
The subject is: ${subject}.

Make sure the questions follow the typical style and difficulty of the actual CSC exam.
For ${subject}, the topics should be varied but relevant.

Return the result strictly as a JSON object containing a single key "questions" which is an array of exactly 5 questions.
Each question object MUST have the following keys:
- topic (string): The specific topic within the subject (e.g. 'Subject-Verb Agreement' for English, 'Fractions' for Mathematics).
- difficulty (string): "EASY", "MEDIUM", or "HARD"
- questionText (string): The main text of the multiple choice question.
- options (array): Exactly 4 options. Each option must be an object with "id" (A, B, C, or D) and "text" (the answer text).
- correctAnswer (string): The id of the correct option (A, B, C, or D).
- explanation (string): A detailed explanation of why the correct answer is right.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No content generated");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      throw new Error("LLM did not return valid JSON");
    }

    const validation = GeneratedQuestionSchema.safeParse(parsedData);
    
    if (!validation.success) {
      console.error("Zod Validation Error:", validation.error);
      throw new Error("Invalid response format: 'questions' array is missing or malformed against the strict schema");
    }

    const questions = validation.data.questions;

    // Prepare data for createMany
    const questionsToInsert = questions.map((q: any) => ({
      subject,
      topic: q.topic,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      status: 'DRAFT',
      qaNotes: 'AI-Generated Draft',
    }));

    // Insert the generated questions into Prisma using createMany
    await prisma.question.createMany({
      data: questionsToInsert,
    });

    return NextResponse.json({ success: true, questions: questionsToInsert });
  } catch (error: any) {
    console.error("[questions/generate] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
