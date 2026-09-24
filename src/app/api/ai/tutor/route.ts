import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TutorRequestSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  userMessage: z.string().min(1, "Message cannot be empty."),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const parsedBody = TutorRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request parameters.' }, { status: 400 });
    }

    const { questionText, userAnswer, correctAnswer, userMessage } = parsedBody.data;

    const systemPrompt = `You are a supportive, expert Civil Service Exam tutor. 
The user got a question wrong. 
Question: ${questionText}
They answered: ${userAnswer}
Correct Answer: ${correctAnswer}

You are strictly scoped to the provided question. If the user asks an unrelated question (e.g., general knowledge, coding, politics), you must refuse and reply with: 'I'm your tutor for this specific question, so I can only help with topics related to this concept. I can explain the rule, give you examples, or suggest techniques for similar questions.'

When explaining concepts, use a step-by-step structure:
1. Identify the rule/formula.
2. Explain why the user's answer is wrong.
3. Show how to apply the correct rule.
4. State the final answer.

Answer concisely and empathetically. Keep responses under 3 paragraphs if possible.
Return the result STRICTLY as a JSON object containing a single key "reply", whose value is the string response.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'openai/gpt-oss-20b',
      response_format: { type: 'json_object' },
    });

    const aiText = completion.choices[0]?.message?.content;
    if (!aiText) {
      return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 502 });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(aiText);
    } catch (error) {
      console.error('[ai-tutor] JSON Parse Error:', error);
      return NextResponse.json({ error: 'Invalid JSON returned from AI.' }, { status: 500 });
    }

    if (!parsedData.reply || typeof parsedData.reply !== 'string') {
       return NextResponse.json({ error: 'AI hallucinated invalid response structure.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, reply: parsedData.reply });

  } catch (error) {
    console.error('[ai-tutor] Internal Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the tutor response.' },
      { status: 500 }
    );
  }
}
