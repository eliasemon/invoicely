import { Skeleton } from '@/components/ui/skeleton';

export default function CreateLoading() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg pt-sm md:pt-0 pb-[100px]">
      {/* Header Section Skeleton */}
      <section>
        <Skeleton className="h-10 w-48 rounded-lg mb-2" />
        <Skeleton className="h-5 w-32 rounded-md" />
      </section>

      {/* Customer Details Skeleton */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
        <Skeleton className="h-6 w-40 rounded" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24 rounded mb-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 rounded mb-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 rounded mb-2" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* Line Items Section Skeleton */}
      <section className="space-y-md">
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-surface-container-high pb-4">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 pt-4 border-t border-surface-container-high first:border-0 first:pt-0">
                <div className="flex-1">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div className="flex gap-2 w-full md:w-[240px]">
                  <Skeleton className="h-12 w-20 rounded-lg" />
                  <Skeleton className="h-12 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
          
          <Skeleton className="h-10 w-32 rounded-lg mt-4" />
        </div>

        {/* Add Actions Skeleton */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-32 rounded-full" />
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
        
        {/* Discount/Shipping Skeleton */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-12 w-full rounded-lg mt-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Total Skeleton */}
      <div className="bg-surface-container-highest rounded-2xl p-6 border border-outline-variant">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
        <div className="flex justify-between items-center border-t border-outline-variant pt-4">
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="h-10 w-40 rounded" />
        </div>
        
        <div className="mt-6 flex gap-4">
          <Skeleton className="h-14 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
