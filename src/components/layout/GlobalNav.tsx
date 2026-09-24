"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Menu, Target, BookOpen, FileText, ShieldCheck, Database, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function GlobalNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close sheet when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Hide the global nav on these specific routes
  const hiddenRoutes = ["/", "/login", "/onboarding"];
  if (hiddenRoutes.includes(pathname) || role === 'ADMIN') {
    return null;
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-sm flex justify-between items-center p-4 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100">
              <Menu className="w-6 h-6 text-slate-700 cursor-pointer" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] flex flex-col overflow-y-auto">
            <SheetHeader className="mb-6 text-left shrink-0">
              <SheetTitle className="text-2xl font-bold text-csc-blue-dark">CSC Reviewer</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-2 shrink-0">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-csc-blue-dark hover:bg-csc-blue-light/20 flex items-center gap-3">
                  <Home className="w-5 h-5" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/test-center/exam/new">
                <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-csc-blue-dark hover:bg-csc-blue-light/20 flex items-center gap-3">
                  <Target className="w-5 h-5" />
                  Take Mock Exam
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-csc-blue-dark hover:bg-csc-blue-light/20 flex items-center gap-3">
                  <BookOpen className="w-5 h-5" />
                  Study Hall
                </Button>
              </Link>
              <Link href="/dashboard/mistakes">
                <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-csc-blue-dark hover:bg-csc-blue-light/20 flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  Mistake Notebook
                </Button>
              </Link>
            </div>

            {role === 'ADMIN' && (
              <div className="border-t border-slate-200 pt-4 mt-4 mb-2 flex flex-col gap-2 shrink-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-1">Admin Controls</p>
                <Link href="/admin/qa-dashboard">
                  <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-csc-blue-dark hover:bg-csc-blue-light/20 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5" />
                    QA Dashboard
                  </Button>
                </Link>
                <Link href="/admin/question-bank">
                  <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-csc-blue-dark hover:bg-csc-blue-light/20 flex items-center gap-3">
                    <Database className="w-5 h-5" />
                    Question Bank
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-csc-blue-dark hover:bg-csc-blue-light/20 flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    User Management
                  </Button>
                </Link>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4 mt-auto">
              <Button 
                variant="ghost" 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* We can still keep the return to dashboard link on desktop if desired, but as per instructions we just use the hamburger menu */}
        <span className="font-bold text-csc-blue-dark hidden sm:inline-block ml-2 text-lg">
          AI-Powered CSC Reviewer
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* The logout button is moved to the drawer, but keeping one here for quick access is optional. Instructions say: "Keep the existing 'Log out' button clearly separated at the bottom of the drawer or the far right of the header." */}
        <Button 
          variant="ghost" 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
