import { Skeleton } from "@/components/ui/skeleton";

export function CampaignFormSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Skeleton className="h-120" />
        <Skeleton className="h-120" />
      </div>
    </div>
  );
}
