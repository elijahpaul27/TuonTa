"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Database, Users, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "QA Dashboard", href: "/admin/qa-dashboard", icon: ShieldCheck },
    { name: "Question Bank", href: "/admin/question-bank", icon: Database },
    { name: "User Management", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-csc-blue-light bg-doodle">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-50 w-full !bg-white/70 !backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/qa-dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-csc-blue-dark flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-csc-blue-dark hidden sm:inline-block">
                Admin Console
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`gap-2 ${
                        isActive 
                          ? "bg-csc-blue-light/50 text-csc-blue-dark" 
                          : "text-slate-600 hover:text-csc-blue-dark hover:bg-csc-blue-light/30"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden !bg-white/70 !backdrop-blur-md border-b border-slate-200/60 flex overflow-x-auto p-2 gap-2 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="flex-none">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`gap-2 ${isActive ? "bg-csc-blue-light/50 text-csc-blue-dark" : "text-slate-600"}`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>

      <main>
        {children}
      </main>
    </div>
  );
}
