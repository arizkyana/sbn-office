import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Tombol atau link di bawah teks, contoh "Coba lagi". */
  action?: ReactNode;
  className?: string;
};

// Salinan sbn-donatur (backlog 009): state kosong dan error untuk daftar dan grafik.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-8" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
