"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

// "Selamanya" untuk Supabase Auth: ±100 tahun.
const BAN_DURATION = "876000h";

/**
 * Nonaktifkan atau aktifkan kembali akun donatur (AKN011). Ban di Auth membuat
 * donatur tidak bisa login dan session aktifnya tidak bisa diperpanjang;
 * `profiles.is_active` dibaca sbn-donatur (login, requireDonatur, prefill donasi).
 */
export async function setDonorActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  if (!z.uuid().safeParse(id).success || typeof active !== "boolean") {
    return { success: false, message: "Donatur tidak ditemukan" };
  }

  // Akun ADMIN tidak boleh diubah lewat halaman donatur.
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error(`Gagal membaca profil ${id}:`, error);
    return { success: false, message: "Status akun gagal diubah. Coba lagi." };
  }
  if (profile?.role !== "DONATUR") {
    return { success: false, message: "Donatur tidak ditemukan" };
  }

  // Admin client: tidak ada policy update profiles untuk admin, dan grant kolom
  // hanya (full_name, phone). Ban juga hanya bisa lewat service role.
  const admin = createAdminClient();
  const { error: banError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: active ? "none" : BAN_DURATION,
  });
  if (banError) {
    console.error(`Gagal mengubah ban donatur ${id}:`, banError);
    return { success: false, message: "Status akun gagal diubah. Coba lagi." };
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ is_active: active })
    .eq("id", id);
  if (updateError) {
    console.error(`Gagal mengubah is_active donatur ${id}:`, updateError);
    // Kembalikan ban agar Auth dan profiles tidak berbeda status.
    await admin.auth.admin.updateUserById(id, {
      ban_duration: active ? BAN_DURATION : "none",
    });
    return { success: false, message: "Status akun gagal diubah. Coba lagi." };
  }

  revalidatePath(`/donors/${id}`);
  return { success: true };
}
