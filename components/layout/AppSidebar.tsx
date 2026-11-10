"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_ITEMS, isActivePath } from "./navigation";
import { SiteLogo } from "./SiteLogo";

// Item aktif: pill hijau lembut, bahasa visual yang sama dengan Bottom
// Navigation sbn-donatur (backlog 009).
const ACTIVE_ITEM_CLASS =
  "data-active:bg-primary/10 data-active:font-semibold data-active:text-primary";
const MENU_BUTTON_CLASS = `h-10 gap-3 text-sm font-medium [&_svg]:size-5 ${ACTIVE_ITEM_CLASS}`;

type AppSidebarProps = {
  footer: ReactNode;
};

export function AppSidebar({ footer }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  // Di layar kecil sidebar berupa drawer; tutup setelah menu dipilih.
  const closeMobileSidebar = () => setOpenMobile(false);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <SiteLogo
            size={36}
            alt="Logo Sobat Baik Nusantara"
            className="size-9 rounded-full"
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-base font-bold">SBN Office</span>
            <span className="text-sm text-muted-foreground">Panel Admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {item.children ? (
                    <>
                      {/* Induk sub-menu hanya berwarna saat anaknya aktif, tanpa pill. */}
                      <SidebarMenuButton
                        isActive={isActivePath(pathname, item.href)}
                        className={`${MENU_BUTTON_CLASS} data-active:bg-transparent`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              isActive={isActivePath(pathname, child.href)}
                              className={`h-9 text-sm ${ACTIVE_ITEM_CLASS}`}
                              render={
                                <Link
                                  href={child.href}
                                  onClick={closeMobileSidebar}
                                />
                              }
                            >
                              <span>{child.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <SidebarMenuButton
                      isActive={isActivePath(pathname, item.href)}
                      className={MENU_BUTTON_CLASS}
                      render={
                        <Link href={item.href} onClick={closeMobileSidebar} />
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{footer}</SidebarFooter>
    </Sidebar>
  );
}
