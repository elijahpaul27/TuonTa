import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { QuestionBankClient } from './QuestionBankClient';

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await auth();

  if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const page = parseInt(searchParams.page || '1', 10);
  const limit = 10;
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

  return (
    <div className="min-h-screen bg-csc-blue-light p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-csc-blue-dark">Question Bank Management</h1>
        <p className="text-slate-600">View and manage all VERIFIED and REJECTED questions.</p>
        
        <QuestionBankClient 
          initialQuestions={questions} 
          totalCount={totalCount} 
          currentPage={page}
          limit={limit}
        />
      </div>
    </div>
  );
}
