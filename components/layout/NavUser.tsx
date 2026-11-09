import { LogOutIcon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "./actions";

// Wajib dibungkus <Suspense> karena membaca session (aturan cacheComponents).
export async function NavUser() {
  const user = await getCurrentUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex flex-col px-2 py-1.5 text-sm">
          <span className="truncate font-medium">
            {user?.fullName ?? "Admin"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user?.email}
          </span>
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <form action={logout}>
          <SidebarMenuButton type="submit">
            <LogOutIcon />
            <span>Keluar</span>
          </SidebarMenuButton>
        </form>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
