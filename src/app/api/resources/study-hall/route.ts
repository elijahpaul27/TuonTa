import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const StudyResourceSchema = z.array(
  z.object({
    title: z.string(),
    type: z.enum(['video', 'article', 'pdf']),
    url: z.string(),
    justification: z.string(),
  })
);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Valid topic string is required.' }, { status: 400 });
    }

    const prompt = `
You are an expert academic tutor helping a student prepare for the Philippine Civil Service Exam (CSE).
The student needs help studying the following topic: "${topic}".

Please recommend exactly 3 highly specific, high-quality, and free internet resources (or precise YouTube search queries disguised as URLs if a direct link is unknown) that will help them master this topic.

Return the result STRICTLY as a JSON object containing a single key "resources", whose value is an array of objects.
Each object in the array MUST have the following keys:
- title (string): The title of the resource.
- type (string): Exactly one of "video", "article", or "pdf".
- url (string): A valid URL to the resource or a YouTube search query URL.
- justification (string): A brief explanation of why this resource is useful for this specific topic.
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
      response_format: { type: 'json_object' },
    });

    const aiText = completion.choices[0]?.message?.content;
    if (!aiText) {
      return NextResponse.json({ error: 'Groq returned an empty response.' }, { status: 502 });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(aiText);
    } catch (error) {
      console.error('[study-hall] JSON Parse Error:', error);
      return NextResponse.json({ error: 'Invalid JSON returned from AI.' }, { status: 500 });
    }

    const rawResources = parsedData.resources || parsedData;

    let validatedResources: z.infer<typeof StudyResourceSchema>;
    try {
      validatedResources = StudyResourceSchema.parse(rawResources);
    } catch (zodError) {
      console.error('[study-hall] Zod Validation Error:', zodError);
      return NextResponse.json({ error: 'AI hallucinated invalid resource structure. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, resources: validatedResources });

  } catch (error) {
    console.error('[study-hall] Internal Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating resources.' },
      { status: 500 }
    );
  }
}
