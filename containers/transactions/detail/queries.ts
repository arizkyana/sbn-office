import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// cache(): cukup satu query per request walau dipanggil lebih dari sekali.
// Server client: admin membaca semua transaksi lewat RLS (is_admin()).
export const getTransactionByUuid = cache(async (uuid: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "uuid, order_id, amount, payment_status, payment_method, payment_url, paid_at, created_at, donor_name, donor_email, donor_phone, is_anonymous, users_id, midtrans_payload, campaigns (uuid, title)",
    )
    .eq("uuid", uuid)
    .maybeSingle();
  if (error) throw error;
  return data;
});
