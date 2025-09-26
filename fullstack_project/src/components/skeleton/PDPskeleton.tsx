const gray = "bg-gray-200 ";

// Generic line
function Line({ w = "100%", h = 14, className = "" }: { w?: string; h?: number; className?: string }) {
  return <div className={`animate-pulse rounded ${gray} ${className}`} style={{ width: w, height: h }} />;
}

// Outer-only box (no inner content)
function Box({ h = 80, className = "" }: { h?: number; className?: string }) {
  return (
    <div className={`rounded-lg  bg-gray-200 ${className}`}>
      <div className="animate-pulse" style={{ height: h }} />
    </div>
  );
}

export default function PDPSkeleton() {
  return (
    <main className="container">
      {/* Breadcrumb placeholder */}
      <div className="mb-3 flex gap-2">
        <Line w="80px" h={12} />
        <Line w="100px" h={12} />
        <Line w="140px" h={12} />
      </div>

      <section className="grid grid-cols-12 gap-8">
        {/* Left image box */}
        <div className="col-span-12 md:col-span-6">
          <Box h={540} />
        </div>

        {/* Right details column */}
        <div className="col-span-12 md:col-span-6 space-y-4">
          {/* Title box */}
          <Line w="60%" h={24} />
          {/* Meta row */}
          <Line w="40%" h={14} />

          {/* Price box */}
          <Line w="20%" h={28} />

          {/* Perks row */}
          <div className="grid grid-cols-2 gap-4">
            <Box h={48} />
            <Box h={48} />
          </div>

          {/* Offers block – outer border only */}
          <Box h={96} />

          {/* Sizes block – outer border only */}
          <Box h={88} />

          {/* CTA buttons block – outer border only */}
          <div className="grid grid-cols-2 gap-3">
            <Box h={56} />
            <Box h={56} />
          </div>
        </div>
      </section>

      {/* Similar Products – single outer box */}
      <div className="mt-8">
        <Line w="200px" h={18} />
        <div className="mt-3">
          <Box h={220} />
        </div>
      </div>

      {/* Customers Also Liked – single outer box */}
      <div className="mt-6">
        <Line w="240px" h={18} />
        <div className="mt-3">
          <Box h={220} />
        </div>
      </div>
    </main>
  );
}
