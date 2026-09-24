import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session?.user?.id || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const { questionText, correctAnswer, explanation, options } = body;

    if (!questionText || !correctAnswer || !options) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        correctAnswer,
        explanation,
        options,
      },
    });

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (error) {
    console.error('[admin/questions/PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update question.' },
      { status: 500 }
    );
  }
}
