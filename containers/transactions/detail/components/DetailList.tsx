import type { ReactNode } from "react";

type DetailListProps = {
  items: { label: string; value: ReactNode }[];
};

/** Daftar label–nilai di dalam card detail transaksi. */
export default function DetailList({ items }: DetailListProps) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
