import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="w-full">
      {/* ProfileNav Skeleton */}
      <div className="h-16 border-b border-outline-variant flex items-center px-4 md:px-8">
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      
      <div className="max-w-[800px] mx-auto py-8 md:py-12 px-margin-mobile md:px-margin-desktop">
        <div className="mb-8">
          <div>
            <Skeleton className="h-10 w-64 rounded-lg mb-2" />
            <Skeleton className="h-5 w-80 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Logo Section Skeleton */}
          <div className="md:col-span-4 relative">
            <div className="sticky top-[160px] bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center gap-6 text-center">
              <Skeleton className="w-full max-w-[240px] h-32 rounded-xl" />
              
              <div className="flex flex-col items-center w-full">
                <Skeleton className="h-4 w-32 rounded mb-2" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
              
              <div className="flex gap-3 mt-2 w-full">
                <Skeleton className="h-10 flex-1 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Details Section Skeleton */}
          <div className="md:col-span-8 flex flex-col gap-8 pb-[100px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-48 rounded" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Action Area Skeleton */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant p-margin-mobile md:px-margin-desktop z-[40]">
        <div className="max-w-[800px] mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
