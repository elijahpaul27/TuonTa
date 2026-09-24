import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, qaNotes } = body;

    // Validate the incoming status
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status provided. Must be VERIFIED or REJECTED.' }, { status: 400 });
    }

    // Mocking Prisma DB update
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Question ${status.toLowerCase()} successfully.`,
      updatedId: id
    });
  } catch (error) {
    console.error(`Error updating QA status for question ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error during verification' }, { status: 500 });
  }
}
