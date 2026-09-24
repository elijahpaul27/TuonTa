import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // 1. Auth + RBAC guard
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin only.' }, { status: 403 });
    }

    // 2. Parse and validate payload
    const body = await request.json();
    const { subject, topic, difficulty, questionText, options, correctAnswer, explanation } = body;

    if (!subject || !topic || !difficulty || !questionText || !options || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topic, difficulty, questionText, options, correctAnswer.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'options must be an array with at least 2 items.' },
        { status: 400 }
      );
    }

    // 3. Insert into DB — defaults to DRAFT per schema
    const question = await prisma.question.create({
      data: {
        subject,
        topic,
        difficulty,
        questionText,
        options,         // Prisma stores this as Json
        correctAnswer,
        explanation: explanation ?? null,
        status: 'DRAFT', // Explicit: must pass QA before serving to users
      },
    });

    return NextResponse.json({ success: true, question }, { status: 201 });
  } catch (error) {
    console.error('[admin/questions/create] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create question.' },
      { status: 500 }
    );
  }
}
