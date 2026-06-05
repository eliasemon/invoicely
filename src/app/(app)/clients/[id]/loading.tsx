import { Skeleton } from '@/components/ui/skeleton';

export default function ClientDetailsLoading() {
  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto">
      {/* Client Header Skeleton */}
      <div className="bg-surface-container-lowest rounded-3xl p-lg md:p-xl border border-outline-variant shadow-sm flex flex-col gap-lg mb-lg">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        <div className="h-px w-full bg-surface-variant"></div>

        {/* Details & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Contact Info */}
          <div className="flex flex-col gap-md">
            <Skeleton className="h-6 w-40 rounded" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-5 w-32 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-5 w-48 rounded" />
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="flex flex-col gap-md">
            <Skeleton className="h-6 w-40 rounded" />
            <div className="flex flex-col gap-sm bg-surface-container-low p-md rounded-2xl border border-outline-variant/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
              </div>
              <div className="flex flex-col gap-xs mt-xs">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="w-full h-3 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs mt-4">
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>

        <Skeleton className="h-14 w-full rounded-2xl" />

        <div className="flex gap-2 overflow-x-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>

        <div className="flex flex-col gap-sm mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
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
    </div>
  );
}
