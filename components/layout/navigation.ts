import {
  HeartHandshakeIcon,
  LayoutDashboardIcon,
  NewspaperIcon,
  ReceiptTextIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

type NavLink = { title: string; href: string };

export type NavItem = NavLink & {
  icon: LucideIcon;
  children?: NavLink[];
};

// Menu sesuai tabel Halaman Office di planning/init.md.
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { title: "Campaign", href: "/campaigns", icon: HeartHandshakeIcon },
  { title: "Transaksi", href: "/transactions", icon: ReceiptTextIcon },
  { title: "Donatur", href: "/donors", icon: UsersIcon },
  {
    title: "Blog",
    href: "/blog",
    icon: NewspaperIcon,
    children: [
      { title: "Artikel & Video", href: "/blog/posts" },
      { title: "Kategori", href: "/blog/categories" },
    ],
  },
  { title: "Pengaturan", href: "/settings", icon: SettingsIcon },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
