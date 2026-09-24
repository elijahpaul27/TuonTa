import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClientView } from "./DashboardClientView";
import { SubjectMastery } from "@/components/dashboard/SubjectMasteryList";

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getDashboardData(userId: string) {
  const [user, masteryRecords, sessionRecords] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),

    // Most recent mastery per subject+topic (distinct not supported directly in
    // Prisma without raw SQL, so we fetch all and de-dupe in JS)
    prisma.topicMastery.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),

    // Completed test sessions for metrics
    prisma.testSession.findMany({
      where: { userId, completedAt: { not: null } },
      select: { overallScore: true, completedAt: true },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  // ── User data ──────────────────────────────────────────────────────────────
  const userData = {
    name: user?.name ?? user?.email?.split("@")[0] ?? "Reviewer",
    examLevel: "Professional", // Can be a user profile field in a future phase
    targetDate: "Civil Service Exam 2026",
  };

  // ── Metrics ────────────────────────────────────────────────────────────────
  const testsCompleted = sessionRecords.length;
  const scores = sessionRecords
    .map((s) => s.overallScore)
    .filter((s): s is number => s !== null);
  const averageScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

  // Study streak: consecutive days with at least one completed session (simplified)
  let studyStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const hasSession = sessionRecords.some((s) => {
      const d = new Date(s.completedAt!);
      return d >= day && d < nextDay;
    });
    if (hasSession) studyStreak++;
    else if (i > 0) break; // Gap found — streak ends
  }

  const metrics = { averageScore, testsCompleted, studyStreak };

  // ── Topic masteries ────────────────────────────────────────────────────────
  // De-dupe: keep the most recent record per subject+topic
  const seen = new Set<string>();
  const latestMasteries = masteryRecords.filter((m) => {
    const key = `${m.subject}__${m.topic}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const masteries: SubjectMastery[] = latestMasteries.map((m) => ({
    subject: `${m.subject}: ${m.topic}`,
    percentage: Math.round(m.percentage),
    status: m.masteryLevel as SubjectMastery["status"],
  }));

  // ── AI Recommendation ──────────────────────────────────────────────────────
  // Find the worst-performing topic to surface as the recommendation
  const worstTopic = [...latestMasteries].sort((a, b) => a.percentage - b.percentage)[0];

  const aiRecommendation =
    worstTopic
      ? {
        focusArea: `${worstTopic.subject}: ${worstTopic.topic}`,
        reason: `Your performance in "${worstTopic.topic}" is at ${Math.round(worstTopic.percentage)}% — below the ${worstTopic.masteryLevel === "PRIORITY_REVIEW" ? "65%" : "80%"} threshold. Consistent errors here will pull down your overall score.`,
        actionableStep: `Click "Practice Weak Areas" to get 15 AI-targeted questions focused on ${worstTopic.topic}.`,
      }
      : {
        focusArea: "Start Practicing!",
        reason:
          "You haven't taken any exams yet. Complete your first mock exam so the AI can identify where you need the most help.",
        actionableStep:
          'Click "Practice Weak Areas" for a random mix, or "Take Mock Exam" for a full simulation.',
      };

  return { userData, metrics, masteries, aiRecommendation };
}

import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { PerformanceSummary } from "@/components/dashboard/PerformanceSummary";
import { SubjectMasteryList } from "@/components/dashboard/SubjectMasteryList";
import { AIActionCard } from "@/components/dashboard/AIActionCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DailyReviewWidget } from "@/components/dashboard/DailyReviewWidget";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { HoverInteractWrapper } from "@/components/ui/HoverInteractWrapper";

import { DashboardMotionLayout, DashboardMotionItem } from "@/components/dashboard/DashboardMotionLayout";

import { EngagementMessage } from "@/components/ui/EngagementMessage";

export const metadata = {
  title: "Dashboard | CSC Reviewer",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-[#E0F2FE] to-white pt-10">
      <DashboardMotionLayout>
        {/* Top-Level Full Width Elements */}
        
        <DashboardMotionItem>
          <div className="bg-blue-50/50 p-2 rounded-xl mb-6 flex justify-center items-center shadow-sm border border-blue-100/50 max-w-3xl mx-auto">
            <EngagementMessage type="hack" className="!bg-transparent !border-none !shadow-none py-1" />
          </div>
        </DashboardMotionItem>

        <DashboardMotionItem>
          <WelcomeHeader
            userName={data.userData.name}
            examLevel={data.userData.examLevel}
            targetDate={data.userData.targetDate}
          />
        </DashboardMotionItem>

        <DashboardMotionItem>
          <PerformanceSummary
            averageScore={data.metrics.averageScore}
            testsCompleted={data.metrics.testsCompleted}
            studyStreak={data.metrics.studyStreak}
          />
        </DashboardMotionItem>

        {/* Asymmetric Widescreen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* Left Pane (col-span-2) - Passive Tracking */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardMotionItem>
              <AchievementBadges />
            </DashboardMotionItem>
            <DashboardMotionItem>
              <SubjectMasteryList masteries={data.masteries} />
            </DashboardMotionItem>
          </div>

          {/* Right Pane (col-span-1) - Active Learning */}
          <div className="space-y-6">
            {/* 1. Highest Priority Action: Daily SM-2 Queue */}
            <DashboardMotionItem>
              <DailyReviewWidget />
            </DashboardMotionItem>

            {/* 2. AI Guided Focus */}
            <DashboardMotionItem>
              <AIActionCard recommendation={data.aiRecommendation} />
            </DashboardMotionItem>

            {/* 3. Standard Mock Exam */}
            <DashboardMotionItem>
              <HoverInteractWrapper scaleAmt={1.02}>
                <div className="!bg-white/70 !backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm text-center w-full">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Ready for a challenge?</h3>
                  <p className="text-slate-500 text-sm mb-4">Take a full mock exam to gauge your readiness.</p>
                  <Link href="/test-center/exam/new" className="block w-full">
                    <HoverInteractWrapper scaleAmt={1.05}>
                      <Button className="w-full bg-csc-blue-dark text-white hover:bg-csc-blue-dark/90 shadow-sm h-11 pointer-events-auto relative z-10">
                        Take Mock Exam
                      </Button>
                    </HoverInteractWrapper>
                  </Link>
                </div>
              </HoverInteractWrapper>
            </DashboardMotionItem>

            {/* 4. Curated Study Hall */}
            <DashboardMotionItem>
              <HoverInteractWrapper scaleAmt={1.02}>
                <div className="!bg-white/70 !backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm text-center w-full">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Curated Study Hall</h3>
                  <p className="text-slate-500 text-sm mb-4">Access AI-curated video tutorials and cheat sheets for your weakest subjects.</p>
                  <Link href="/resources" className="block w-full">
                    <HoverInteractWrapper scaleAmt={1.05}>
                      <Button variant="outline" className="w-full border-slate-200 text-csc-blue-dark hover:bg-csc-blue-light/40 shadow-sm h-11 pointer-events-auto relative z-10">
                        Enter Study Hall
                      </Button>
                    </HoverInteractWrapper>
                  </Link>
                </div>
              </HoverInteractWrapper>
            </DashboardMotionItem>

            {/* 5. Deep Review */}
            <DashboardMotionItem>
              <HoverInteractWrapper scaleAmt={1.02}>
                <div className="!bg-white/70 !backdrop-blur-md p-6 rounded-xl border border-slate-200/60 shadow-sm text-center w-full">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Review Your Mistakes</h3>
                  <p className="text-slate-500 text-sm mb-4">Study every question you got wrong, grouped by topic.</p>
                  <Link href="/dashboard/mistakes" className="block w-full">
                    <HoverInteractWrapper scaleAmt={1.05}>
                      <Button variant="outline" className="w-full border-slate-200 text-csc-blue-dark hover:bg-csc-blue-light/40 shadow-sm h-11 pointer-events-auto relative z-10">
                        Open Mistake Notebook
                      </Button>
                    </HoverInteractWrapper>
                  </Link>
                </div>
              </HoverInteractWrapper>
            </DashboardMotionItem>
          </div>

        </div>
      </DashboardMotionLayout>
    </main>
  );
}
