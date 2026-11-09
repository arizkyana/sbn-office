import { Suspense } from "react";
import { AdminGate } from "@/components/layout";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense
      fallback={<p className="p-6 text-sm text-muted-foreground">Memuat…</p>}
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
