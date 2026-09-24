import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export async function DailyReviewWidget() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();

  // Find all question attempts for this user that are due for review today or earlier
  const dueReviewsCount = await prisma.questionAttempt.count({
    where: {
      userId: session.user.id,
      nextReviewDate: { lte: now },
    },
  });

  if (dueReviewsCount === 0) {
    return null; // Don't show the widget if there's nothing to review
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-none">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900">Daily SM-2 Review</h3>
          <p className="text-amber-800 text-sm">
            You have <span className="font-bold">{dueReviewsCount}</span> question{dueReviewsCount !== 1 ? 's' : ''} due for spaced repetition review today.
          </p>
        </div>
      </div>
      <Button asChild className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white border-none shrink-0">
        <Link href="/test-center/targeted">
          Review Now
        </Link>
      </Button>
    </div>
  );
}
