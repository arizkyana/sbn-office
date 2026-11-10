import { LogOutIcon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "./actions";

/** Inisial untuk avatar, contoh "Siti Aminah" → "SA". */
function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "A"
  );
}

// Wajib dibungkus <Suspense> karena membaca session (aturan cacheComponents).
export async function NavUser() {
  const user = await getCurrentUser();
  const name = user?.fullName ?? "Admin";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-3 px-2 py-2">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          >
            {getInitials(name)}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{name}</span>
            <span className="truncate text-sm text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <form action={logout}>
          <SidebarMenuButton
            type="submit"
            className="h-10 gap-3 text-sm font-medium [&_svg]:size-5"
          >
            <LogOutIcon />
            <span>Keluar</span>
          </SidebarMenuButton>
        </form>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
