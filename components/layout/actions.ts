"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Pengecualian aturan requireAdmin(): user nonaktif pun harus bisa keluar.
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
