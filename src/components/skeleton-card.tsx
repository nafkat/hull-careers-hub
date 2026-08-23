/** Shimmering placeholder with the same footprint as a JobCard. */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`skeleton-plate h-[220px] w-full ${className}`}
    />
  );
}

/** Grid of job-card skeletons used while listings load. */
export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading positions"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/** Shimmering rows for admin tables. */
export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading rows">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-plate h-12 w-full" />
      ))}
    </div>
  );
}
