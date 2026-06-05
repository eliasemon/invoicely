import { Skeleton } from '@/components/ui/skeleton';

export default function CustomizeLoading() {
  return (
    <div className="w-full max-w-[512px] mx-auto space-y-lg pt-sm md:pt-0 pb-[100px] print:hidden">
      {/* Progress Indicator Skeleton */}
      <div className="flex items-center justify-between px-xs">
        <div className="flex flex-col items-center flex-1 gap-1">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <div className="h-[2px] bg-surface-variant flex-1 mx-2"></div>
        <div className="flex flex-col items-center flex-1 gap-1">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>

      {/* Template Selector Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-[1/1.4] w-full rounded-xl" />
              <Skeleton className="h-4 w-24 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Preview Button Skeleton */}
      <Skeleton className="w-full h-12 rounded-lg" />

      {/* Fixed Bottom Action Area Skeleton */}
      <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant p-margin-mobile pb-safe shadow-[0_-4px_12px_rgba(26,43,60,0.05)] z-40 md:static md:shadow-none md:border-none md:p-0 md:bg-transparent md:mt-xl">
        <div className="max-w-[512px] mx-auto flex flex-col gap-sm">
          <Skeleton className="w-full h-12 rounded-lg" />
          <div className="flex gap-sm">
            <Skeleton className="flex-1 h-12 rounded-lg" />
            <Skeleton className="flex-1 h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
