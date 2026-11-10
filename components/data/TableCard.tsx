import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TableCardProps = {
  children: ReactNode;
  /** Meredupkan data halaman sebelumnya yang masih tampil saat halaman baru dimuat. */
  isStale?: boolean;
  className?: string;
};

/**
 * Pembungkus tabel bergaya kartu (`shadow-card`). Tabel lebar di-scroll
 * horizontal di dalam kartu lewat pembungkus bawaan `Table`.
 */
export function TableCard({ children, isStale, className }: TableCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-card shadow-card transition-opacity",
        isStale && "opacity-60",
        className,
      )}
    >
      {children}
    </div>
  );
}
