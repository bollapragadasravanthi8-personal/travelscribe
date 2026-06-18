import { Skeleton } from "@/components/ui/skeleton";

type LoadingSkeletonProps = {
  rows?: number;
};

export function LoadingSkeleton({ rows = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
