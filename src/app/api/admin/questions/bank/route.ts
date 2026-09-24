import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where: {
          status: {
            in: ['VERIFIED', 'REJECTED'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.question.count({
        where: {
          status: {
            in: ['VERIFIED', 'REJECTED'],
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, questions, totalCount });
  } catch (error: any) {
    console.error("[questions/bank] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch question bank" },
      { status: 500 }
    );
  }
}
