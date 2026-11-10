import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Server client: admin membaca semua profil dan transaksi lewat RLS (is_admin()).
// cache(): cukup satu query per request walau dipanggil lebih dari sekali.

/** Profil donatur. `null` bila tidak ada atau bukan DONATUR (akun ADMIN tidak tampil di sini). */
export const getDonorById = cache(async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active, created_at")
    .eq("id", id)
    .eq("role", "DONATUR")
    .maybeSingle();
  if (error) throw error;
  return data;
});

/**
 * Total nominal dan jumlah donasi berhasil yang dilakukan saat donatur masuk ke
 * akunnya (transaksi SUCCESS dengan `users_id` donatur).
 */
export const getDonorSuccessSummary = cache(async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("users_id", id)
    .eq("payment_status", "SUCCESS");
  if (error) throw error;

  return {
    total: data.reduce((sum, transaction) => sum + transaction.amount, 0),
    count: data.length,
  };
});
