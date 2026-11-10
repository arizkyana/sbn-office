import { Skeleton } from "@/components/ui/skeleton";

export function DonorDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72 lg:col-span-2" />
      </div>
    </div>
  );
}
