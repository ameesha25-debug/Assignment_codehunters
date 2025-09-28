type GridProps = {
  count?: number;            // number of placeholder tiles
  showActions?: boolean;     // show two action button placeholders
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-transparent border border-gray-300 ${className}`}
      aria-hidden="true"
    />
  );
}

export function WishlistCardSkeleton({
  showActions = true,
}: {
  showActions?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="aspect-[5/6]">
        <SkeletonBlock className="h-full w-full" />
      </div>
      <div className="p-2.5">
        <SkeletonBlock className="h-4 w-4/5" />
        <SkeletonBlock className="mt-2 h-4 w-1/3" />
        <SkeletonBlock className="mt-2 h-3 w-1/4" />
        {showActions && (
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <SkeletonBlock className="h-8 w-full" />
            <SkeletonBlock className="h-8 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function WishlistSkeleton({
  count = 12,
  showActions = true,
}: GridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <WishlistCardSkeleton key={i} showActions={showActions} />
      ))}
    </div>
  );
}
