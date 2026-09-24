"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, GraduationCap, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

type ExamLevel = "PROFESSIONAL" | "SUBPROFESSIONAL";

export function OnboardingForm() {
  const router = useRouter();
  const { update } = useSession();
  const [examLevel, setExamLevel] = useState<ExamLevel | null>(null);
  const [targetExamDate, setTargetExamDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get today + 1 day as minimum date for the picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!examLevel) {
      setError("Please select an exam level.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examLevel,
          targetExamDate: targetExamDate || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save your setup. Please try again.");
        setIsLoading(false);
        return;
      }

      // 1. Pass the selected examLevel directly into the NextAuth token.
      //    The jwt callback's `trigger === 'update'` branch merges it in,
      //    so the middleware immediately sees the new value on the next request.
      await update({ examLevel });

      // 2. Push to dashboard and force Server Components to re-render with
      //    the freshly minted session cookie.
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg border-csc-blue-mid shadow-lg bg-white">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-csc-blue-dark">
          Set Up Your Study Plan
        </CardTitle>
        <CardDescription className="text-slate-500">
          Tell us about your exam goals so we can personalize your experience.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          {/* Exam Level Selector */}
          <div className="space-y-3">
            <Label className="text-slate-700 font-semibold text-sm uppercase tracking-wide">
              Which exam are you preparing for?
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Professional */}
              <button
                type="button"
                id="level-professional"
                onClick={() => setExamLevel("PROFESSIONAL")}
                className={cn(
                  "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer",
                  examLevel === "PROFESSIONAL"
                    ? "border-csc-blue-dark bg-csc-blue-light/50 shadow-md"
                    : "border-csc-blue-mid/40 hover:border-csc-blue-mid hover:bg-csc-blue-light/20"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    examLevel === "PROFESSIONAL"
                      ? "bg-csc-blue-dark text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Professional</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For degree holders applying to career service
                  </p>
                </div>
                {examLevel === "PROFESSIONAL" && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-csc-blue-dark flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </button>

              {/* Sub-Professional */}
              <button
                type="button"
                id="level-subprofessional"
                onClick={() => setExamLevel("SUBPROFESSIONAL")}
                className={cn(
                  "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer",
                  examLevel === "SUBPROFESSIONAL"
                    ? "border-csc-blue-dark bg-csc-blue-light/50 shadow-md"
                    : "border-csc-blue-mid/40 hover:border-csc-blue-mid hover:bg-csc-blue-light/20"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    examLevel === "SUBPROFESSIONAL"
                      ? "bg-csc-blue-dark text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Sub-Professional</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For high school graduates entering public service
                  </p>
                </div>
                {examLevel === "SUBPROFESSIONAL" && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-csc-blue-dark flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Target Exam Date */}
          <div className="space-y-2">
            <Label htmlFor="targetExamDate" className="text-slate-700 font-semibold">
              Target Exam Date{" "}
              <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="targetExamDate"
              type="date"
              min={minDate}
              value={targetExamDate}
              onChange={(e) => setTargetExamDate(e.target.value)}
              className="border-csc-blue-mid/50 focus-visible:ring-csc-blue-dark bg-white"
            />
            <p className="text-xs text-slate-500">
              We&apos;ll use this to show how many days you have left to prepare.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            id="onboarding-submit"
            className="w-full bg-csc-yellow text-slate-900 font-bold hover:brightness-95 shadow-sm h-11 flex items-center gap-2"
            disabled={isLoading || !examLevel}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Start Preparing →"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
