import { Suspense } from "react";
import { Dashboard, DashboardSkeleton } from "@/containers/dashboard";

// Suspense di sini, bukan loading.tsx: loading.tsx di (dashboard)/ akan ikut
// membungkus semua halaman lain di route group ini.
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
