import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <>
      {/* Search Section Skeleton */}
      <section className="w-full">
        <Skeleton className="h-14 w-full rounded-2xl" />
      </section>

      {/* Summary Cards Skeleton */}
      <div className="w-full space-y-md">
        <div className="flex items-center justify-between mb-md">
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
        
        <div className="space-y-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <section className="flex gap-sm">
        <Skeleton className="h-[48px] flex-1 rounded-xl" />
        <Skeleton className="h-[48px] w-[56px] rounded-xl" />
      </section>

      {/* Recent Invoices Skeleton */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_4px_12px_rgba(26,43,60,0.05)] overflow-hidden">
        <div className="p-md border-b border-outline-variant flex justify-between items-center">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex flex-col p-md gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
