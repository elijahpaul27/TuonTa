import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currentStreak: true, longestStreak: true, lastActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    // Start of current day (local server time or UTC, depending on implementation)
    // We will use UTC to keep it consistent
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    let currentStreak = user.currentStreak;
    let longestStreak = user.longestStreak;

    if (user.lastActive) {
      const lastActiveDate = new Date(user.lastActive);
      const lastActiveDay = new Date(Date.UTC(lastActiveDate.getUTCFullYear(), lastActiveDate.getUTCMonth(), lastActiveDate.getUTCDate()));
      
      const diffTime = Math.abs(today.getTime() - lastActiveDay.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else if (diffDays > 1) {
        // Streak broken
        currentStreak = 1;
      }
      // If diffDays === 0, they already logged in today, streak remains the same
    } else {
      // First time active
      currentStreak = 1;
      longestStreak = 1;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currentStreak,
        longestStreak,
        lastActive: now,
      },
      select: {
        currentStreak: true,
        longestStreak: true,
      }
    });

    return NextResponse.json({ success: true, streak: updatedUser });

  } catch (error) {
    console.error('[streak] Error updating streak:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the streak.' },
      { status: 500 }
    );
  }
}
