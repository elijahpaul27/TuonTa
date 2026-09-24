import { QADashboardClient } from "./QADashboardClient";
// import { getServerSession } from "next-auth"; // For strict RBAC
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

async function getDraftQuestions() {
  return await prisma.question.findMany({ 
    where: { status: 'DRAFT' }, 
    orderBy: { createdAt: 'desc' } 
  });
}

export default async function QADashboardPage() {
  // Mock RBAC Check: Ensure only Admins can access this route
  // const session = await getServerSession();
  // if (session?.user?.role !== 'ADMIN') redirect('/dashboard');
  const isAdmin = true; // Simulating a valid admin session
  
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const draftQuestions = await getDraftQuestions();

  return <QADashboardClient initialQuestions={draftQuestions} />;
}
