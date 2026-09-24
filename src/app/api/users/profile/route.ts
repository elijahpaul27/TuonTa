import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examLevel, targetExamDate } = body;

    // Validate examLevel
    if (!examLevel || !['PROFESSIONAL', 'SUBPROFESSIONAL'].includes(examLevel)) {
      return NextResponse.json(
        { error: 'Invalid examLevel. Must be PROFESSIONAL or SUBPROFESSIONAL.' },
        { status: 400 }
      );
    }

    // Validate targetExamDate if provided
    let parsedDate: Date | undefined;
    if (targetExamDate) {
      parsedDate = new Date(targetExamDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid targetExamDate format.' },
          { status: 400 }
        );
      }
      // Must be in the future
      if (parsedDate <= new Date()) {
        return NextResponse.json(
          { error: 'Target exam date must be in the future.' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        examLevel,
        targetExamDate: parsedDate ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        examLevel: true,
        targetExamDate: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[users/profile PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    );
  }
}
