"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { loginSchema, type LoginInput } from "./Login.types";

// Pengecualian aturan requireAdmin(): login dipanggil sebelum ada session.
export async function login(input: LoginInput): Promise<ActionResult> {
  const result = loginSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: "Periksa kembali email dan password",
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(result.data);
  if (error) {
    return { success: false, message: "Email atau password salah" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();
  if (profile?.role !== "ADMIN" || !profile.is_active) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Akun ini tidak memiliki akses ke SBN Office",
    };
  }

  redirect("/");
}
