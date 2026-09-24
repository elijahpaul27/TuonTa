import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingForm } from "@/components/auth/OnboardingForm";

export const metadata = {
  title: "Set Up Your Study Plan | CSC Reviewer",
  description: "Configure your Civil Service Exam level and target date to personalize your study experience.",
};

export default async function OnboardingPage() {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // If the user already completed onboarding, redirect to dashboard
  // (The middleware will usually handle this, but this is a safety net)
  if ((session.user as any).examLevel) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-csc-blue-light via-white to-csc-blue-light/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-csc-blue-dark tracking-tight">
            Welcome to CSC Reviewer
          </h1>
          <p className="text-slate-600 mt-2 font-medium">
            Let&apos;s personalize your preparation journey.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-csc-blue-dark text-white text-xs flex items-center justify-center font-bold">✓</div>
            <span className="text-xs text-csc-blue-dark font-medium">Account Created</span>
          </div>
          <div className="w-8 h-0.5 bg-csc-blue-mid" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-csc-yellow text-slate-900 text-xs flex items-center justify-center font-bold">2</div>
            <span className="text-xs text-slate-700 font-medium">Study Setup</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 text-xs flex items-center justify-center font-bold">3</div>
            <span className="text-xs text-slate-400 font-medium">Dashboard</span>
          </div>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
