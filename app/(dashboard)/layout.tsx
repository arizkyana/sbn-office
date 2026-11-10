import { Suspense } from "react";
import Image from "next/image";
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
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 bg-card/90 px-4 shadow-card backdrop-blur">
          <SidebarTrigger size="icon" />
          {/* Di HP sidebar tertutup, jadi identitas aplikasi tampil di header. */}
          <div className="flex items-center gap-2 md:hidden">
            <Image
              src="/logo-sbn.jpg"
              alt=""
              width={28}
              height={28}
              className="size-7 rounded-full"
            />
            <span className="text-base font-bold">SBN Office</span>
          </div>
        </header>
        <Suspense fallback={<Skeleton className="m-6 h-8 w-48" />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
