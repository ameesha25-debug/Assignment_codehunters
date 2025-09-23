

export function SkeletonLine({ w = "100%", h = 14, className = "" }: { w?: string; h?: number; className?: string }) {
  return <div className={`animate-pulse rounded  bg-gray-200 ${className}`} style={{ width: w, height: h }} />;
}

export function SkeletonChip({ w = 64 }: { w?: number }) {
  return <div className="animate-pulse rounded  bg-gray-200" style={{ width: w, height: 28 }} />;
}

export function SkeletonFilterBlock() {
  return (
    <div className="rounded-lg  bg-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <SkeletonLine w="40%" h={14} />
        <SkeletonLine w="20%" h={12} />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonChip key={i} w={72} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg  bg-gray-200">
      <div className="animate-pulse bg-muted/40" style={{ aspectRatio: "3/4" }} />
      <div className="p-3">
        <SkeletonLine w="90%" h={14} />
        <div className="mt-2" />
        <SkeletonLine w="40%" h={14} />
        <div className="mt-2" />
        <SkeletonLine w="60%" h={12} />
      </div>
    </div>
  );
}

export function SkeletonFilterColumn() {
  return (
    <div className="sticky top-16 pt-0 mt-0 space-y-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <SkeletonLine w="30%" h={14} />
        <SkeletonLine w="18%" h={12} />
      </div>
      <SkeletonFilterBlock />
      <SkeletonFilterBlock />
      <SkeletonFilterBlock />
      <SkeletonFilterBlock />
    </div>
  );
}

export function SkeletonRightHeader({ withShopFor = false }: { withShopFor?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <SkeletonLine w="220px" h={14} />
        {withShopFor && (
          <div className="flex items-center gap-2 flex-wrap">
            <SkeletonChip w={48} />
            <SkeletonChip w={56} />
            <SkeletonChip w={64} />
            <SkeletonChip w={72} />
          </div>
        )}
      </div>
      <div className="ml-6 flex items-center gap-2">
        <SkeletonLine w="80px" h={12} />
        <SkeletonLine w="120px" h={36} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}



export function SkeletonEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SkeletonLine w="360px" h={24} />
      <div className="mt-3" />
      <SkeletonLine w="420px" h={14} />
      <div className="mt-6 flex gap-2">
        <SkeletonChip w={48} />
        <SkeletonChip w={40} />
        <SkeletonChip w={64} />
      </div>
    </div>
  );
}
