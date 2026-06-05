import { Skeleton } from '@/components/ui/skeleton';

export default function InvoiceDetailLoading() {
  return (
    <div className="font-body-md antialiased min-h-screen pb-xl">
      {/* TopAppBar Skeleton */}
      <header className="bg-surface dark:bg-background w-full top-0 sticky border-b border-outline-variant dark:border-outline z-40">
        <div className="flex items-center justify-between px-md py-xs w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-sm">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Main Content Area Skeleton */}
        <div className="md:col-span-8 flex flex-col gap-gutter">
          {/* Invoice Summary Card */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level1 border border-surface-variant p-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-sm">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-8 w-40 rounded" />
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-5 w-48 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-sm border-b border-surface-container-high pb-md mb-md">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-28 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-28 rounded" />
              </div>
            </div>

            {/* Itemized List Skeleton */}
            <div>
              <Skeleton className="h-4 w-24 rounded mb-sm" />
              <div className="flex flex-col space-y-4">
                <Skeleton className="h-6 w-32 rounded mb-2" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-sm border-b border-surface-container-high last:border-0">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Financial Overview Skeleton */}
        <div className="md:col-span-4 flex flex-col gap-gutter">
          {/* Financial Overview Bento */}
          <section className="bg-surface-variant/20 rounded-xl shadow-level1 p-md flex flex-col justify-between border border-surface-variant">
            <Skeleton className="h-4 w-32 rounded mb-md" />
            
            <div className="flex justify-between items-end mb-sm">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
            
            <div className="flex justify-between items-end mb-lg">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
            
            <div className="pt-sm border-t border-outline-variant/30">
              <Skeleton className="h-4 w-32 rounded mb-2" />
              <Skeleton className="h-10 w-32 rounded" />
              <Skeleton className="h-10 w-full rounded-lg mt-4" />
            </div>
          </section>

          {/* Action Area Skeleton */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level1 border border-surface-variant p-md">
            <Skeleton className="h-4 w-32 rounded mb-md" />
            <div className="mb-md space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </section>
        </div>
      </main>
    </div>
  );
}
