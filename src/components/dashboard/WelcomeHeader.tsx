"use client";

import { signOut } from "next-auth/react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudOff, RefreshCw, CheckCircle2, LogOut } from "lucide-react";

interface WelcomeHeaderProps {
  userName: string;
  examLevel: string;
  targetDate: string;
}

export function WelcomeHeader({ userName, examLevel, targetDate }: WelcomeHeaderProps) {
  const { isOnline, isSyncing, pendingExamsCount } = useOfflineSync();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-csc-blue-mid/30 shadow-sm mb-6 gap-4">
      {/* Left: greeting */}
      <div>
        <h1 className="text-3xl font-bold text-csc-blue-dark">Welcome back, {userName}!</h1>
        <p className="text-slate-600 mt-1 font-medium">
          {examLevel} Level • Target: {targetDate}
        </p>
      </div>

      {/* Right: sync status + logout */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Sync status badge */}
        {!isOnline && (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-600 border-slate-300 flex items-center gap-1.5 px-3 py-1"
          >
            <CloudOff className="w-3.5 h-3.5" />
            Offline Mode
          </Badge>
        )}

        {isOnline && pendingExamsCount > 0 && (
          <Badge className="bg-csc-yellow text-slate-900 border-yellow-300 flex items-center gap-1.5 px-3 py-1 shadow-sm font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing
              ? `Syncing ${pendingExamsCount} exams...`
              : `${pendingExamsCount} Exams Pending Sync`}
          </Badge>
        )}

        {isOnline && pendingExamsCount === 0 && (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5 px-3 py-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            All Synced
          </Badge>
        )}

      </div>
    </div>
  );
}
