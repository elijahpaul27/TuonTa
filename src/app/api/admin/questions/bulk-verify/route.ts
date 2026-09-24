import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty ids array provided.' }, { status: 400 });
    }

    await prisma.question.updateMany({
      where: { id: { in: ids } },
      data: { status: 'VERIFIED' }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully verified ${ids.length} questions.`
    });
  } catch (error) {
    console.error("Bulk verification error:", error);
    return NextResponse.json({ error: 'Internal Server Error during bulk verification' }, { status: 500 });
  }
}
