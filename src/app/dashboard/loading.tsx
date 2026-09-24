import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-csc-blue-light/30 pt-10">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Top-Level Full Width Elements */}
        {/* Welcome Header Skeleton */}
        <Skeleton className="h-[120px] w-full rounded-xl mb-6 bg-white border border-csc-blue-mid/30 shadow-sm" />
        
        {/* Performance Summary Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl bg-white border border-csc-blue-mid/30 shadow-sm" />
          <Skeleton className="h-24 rounded-xl bg-white border border-csc-blue-mid/30 shadow-sm" />
          <Skeleton className="h-24 rounded-xl bg-white border border-csc-blue-mid/30 shadow-sm" />
        </div>

        {/* Asymmetric Widescreen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Left Pane (col-span-2) - Passive Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Achievement Badges Skeleton */}
            <div className="bg-white border border-csc-blue-mid/40 rounded-xl p-5 shadow-sm">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>

            {/* Subject Mastery List Skeleton */}
            <div className="bg-white border border-csc-blue-mid/30 rounded-xl p-6 shadow-sm">
              <Skeleton className="h-7 w-64 mb-6" />
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pane (col-span-1) - Active Learning */}
          <div className="space-y-6">
            {/* SM-2 Review Widget Skeleton */}
            <Skeleton className="h-[90px] w-full rounded-xl bg-white border border-csc-blue-mid/30 shadow-sm" />

            {/* AI Action Card Skeleton */}
            <Skeleton className="h-[200px] w-full rounded-xl bg-white border border-csc-blue-mid/30 shadow-sm" />
            
            {/* Mock Exam Skeleton */}
            <Skeleton className="h-[150px] w-full rounded-xl bg-white border border-csc-blue-mid/30 shadow-sm" />

            {/* Study Hall Skeleton */}
            <Skeleton className="h-[150px] w-full rounded-xl bg-white border border-csc-blue-mid/30 shadow-sm" />

            {/* Mistake Notebook Skeleton */}
            <Skeleton className="h-[150px] w-full rounded-xl bg-white border border-csc-blue-mid/30 shadow-sm" />
          </div>

        </div>
      </div>
    </main>
  );
}
