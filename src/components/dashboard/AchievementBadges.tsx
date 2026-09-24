import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedHoverBadge } from "@/components/dashboard/DashboardMotionLayout";
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";
import { WavingCatWrapper } from "@/components/dashboard/WavingCatWrapper";

export const dynamic = 'force-dynamic';

export async function AchievementBadges() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const achievements = await prisma.achievement.findMany({
    where: { userId: session.user.id },
    orderBy: { earnedAt: 'desc' },
  });

  if (achievements.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      {/* WebGL Waving Cat — peeking from the left, behind the card */}
      <WavingCatWrapper className="absolute -left-12 sm:-left-16 top-4 w-16 h-16 sm:w-20 sm:h-20 -z-10" />

      {/* Main Achievements Card — z-10 masks the right half of the cat */}
      <div className="relative z-10 !bg-white/90 !backdrop-blur-md border border-slate-200/60 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-slate-800">Your Achievements</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <HoverInteractWrapper key={achievement.id} scaleAmt={1.05}>
              <Badge 
                variant="secondary" 
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border border-yellow-200 px-3 py-1 flex items-center gap-1.5 shadow-sm transition-colors cursor-default"
                title={achievement.description}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                {achievement.badgeName}
              </Badge>
            </HoverInteractWrapper>
          ))}
        </div>
      </div>
    </div>
  );
}
