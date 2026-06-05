import { Skeleton } from '@/components/ui/skeleton';

export default function InvoicesLoading() {
  return (
    <div className="flex-1 flex flex-col gap-md w-full max-w-2xl mx-auto">
      {/* Search Input Header Skeleton */}
      <div className="flex flex-col gap-xs">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-5 w-72 rounded-md" />
      </div>

      <Skeleton className="h-14 w-full rounded-2xl" />

      {/* Filter Chips Skeleton */}
      <div className="flex gap-2 overflow-x-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Invoices List Skeleton */}
      <div className="flex flex-col gap-sm mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center justify-between">
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
    </div>
  );
}
