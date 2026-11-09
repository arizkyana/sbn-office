import { Suspense } from "react";
import { AdminGate, AppSidebar, NavUser } from "@/components/layout";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      {/* usePathname() di AppSidebar tertunda pada route dengan param dinamis (/campaigns/[uuid]). */}
      <Suspense
        fallback={<div className="hidden w-(--sidebar-width) md:block" />}
      >
        <AppSidebar
          footer={
            <Suspense fallback={<Skeleton className="h-16 w-full" />}>
              <NavUser />
            </Suspense>
          }
        />
      </Suspense>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center border-b px-4">
          <SidebarTrigger />
        </header>
        <Suspense fallback={<Skeleton className="m-6 h-8 w-48" />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
