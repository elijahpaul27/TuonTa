import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma'; // Assumed Prisma client

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause = {};
    if (status) {
      whereClause = { status: status.toUpperCase() };
    }

    // In production:
    // const questions = await prisma.question.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    
    // Mocking response to fit constraints:
    const questions = [
      {
        id: 'q1',
        subject: 'Mathematics',
        topic: 'Ratios',
        difficulty: 'MEDIUM',
        questionText: 'If 3 apples cost $2, how much do 9 apples cost?',
        options: ['A) $4', 'B) $6', 'C) $8', 'D) $9'],
        correctAnswer: 'B) $6',
        explanation: '3 apples = $2. 9 apples is 3 times the amount, so 3 * $2 = $6.',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'q2',
        subject: 'English',
        topic: 'Grammar',
        difficulty: 'HARD',
        questionText: 'Identify the error: "The team of researchers are working on a new formula."',
        options: ['A) The team', 'B) of researchers', 'C) are working', 'D) no error'],
        correctAnswer: 'C) are working',
        explanation: '"The team" is a singular collective noun, so it should be "is working".',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      }
    ];
    
    const filteredQuestions = status 
      ? questions.filter(q => q.status === status.toUpperCase())
      : questions;

    return NextResponse.json(filteredQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
