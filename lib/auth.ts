import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: Enums<"user_role">;
  isActive: boolean;
};

// cache(): dipanggil berkali-kali dalam satu request (gate, sidebar, halaman) cukup sekali query.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name,
    role: profile.role,
    isActive: profile.is_active,
  };
});

export function isActiveAdmin(user: CurrentUser | null): user is CurrentUser {
  return user?.role === "ADMIN" && user.isActive;
}

// Satu-satunya pengecekan admin di sisi aplikasi. Wajib dipanggil di setiap
// Server Action dan Route Handler office, karena proteksi layout tidak melindunginya.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isActiveAdmin(user)) redirect("/auth/login");
  return user;
}
