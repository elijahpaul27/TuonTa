"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, LogOut, DoorOpen } from "lucide-react";

interface ExamSidebarProps {
  questions: any[];
  answers: Record<string, string>;
  currentIndex: number;
  timeRemaining: number;
  onNavigate: (index: number) => void;
}

export function ExamSidebar({ questions, answers, currentIndex, timeRemaining, onNavigate }: ExamSidebarProps) {
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLowTime = timeRemaining < 900; // < 15 mins (900 seconds)

  const handleQuitExam = () => {
    const confirmed = window.confirm(
      "Are you sure you want to quit? Your progress will be lost and this exam session will not be graded."
    );
    if (confirmed) {
      router.push('/dashboard');
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout? Your current exam progress will be lost."
    );
    if (confirmed) {
      signOut({ callbackUrl: '/login' });
    }
  };

  const renderTimer = () => (
    <div className={`text-3xl font-bold p-4 rounded-lg text-center mb-6 border-2 transition-colors ${
      isLowTime 
        ? "bg-slate-900 text-csc-yellow border-csc-yellow shadow-sm" 
        : "bg-white text-csc-blue-dark border-csc-blue-mid"
    }`}>
      {formatTime(timeRemaining)}
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((q, idx) => {
        const isAnswered = !!answers[q.id];
        const isCurrent = idx === currentIndex;

        let btnClass = "w-full h-10 font-medium transition-all border rounded-md flex items-center justify-center";

        if (isCurrent) {
          btnClass += " bg-csc-blue-dark text-white border-csc-blue-dark shadow-sm ring-2 ring-csc-yellow";
        } else if (isAnswered) {
          btnClass += " bg-csc-blue-mid text-white border-csc-blue-mid hover:bg-csc-blue-dark";
        } else {
          btnClass += " bg-white text-slate-700 border-slate-300 hover:bg-slate-50";
        }

        return (
          <button
            key={q.id}
            onClick={() => onNavigate(idx)}
            className={btnClass}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );

  const renderExitControls = () => (
    <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
      <Button
        variant="outline"
        className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        onClick={handleQuitExam}
      >
        <DoorOpen className="w-4 h-4 mr-2" />
        Quit Exam
      </Button>
      <Button
        variant="outline"
        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );

  const answeredCount = questions.filter((q) => !!answers[q.id]).length;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Time Remaining</h3>
        {renderTimer()}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Questions</h3>
          <span className="text-sm text-slate-500 font-medium">
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        {renderGrid()}
        {renderExitControls()}
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full bg-csc-blue-dark hover:bg-csc-blue-dark/90 text-white shadow-lg">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-csc-blue-light/20 backdrop-blur-sm border-l-csc-blue-mid">
            <SheetHeader>
              <SheetTitle className="text-slate-800 mb-6 text-left">Exam Navigation</SheetTitle>
            </SheetHeader>
            {renderTimer()}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Questions</h3>
              <span className="text-sm text-slate-500 font-medium">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
            {renderGrid()}
            {renderExitControls()}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
