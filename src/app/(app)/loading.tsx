import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <LoadingSkeleton rows={4} />
    </div>
  );
}
