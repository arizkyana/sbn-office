import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export const PAGE_SIZE = 10;

type DonorTransactionsParams = {
  donorId: string;
  page: number;
};

async function fetchDonorTransactions({
  donorId,
  page,
}: DonorTransactionsParams) {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;

  // Kolom sama dengan TransactionTableRow (daftar transaksi TRX003).
  const { data, count, error } = await supabase
    .from("transactions")
    .select(
      "uuid, order_id, created_at, donor_name, donor_email, is_anonymous, amount, payment_method, payment_status, campaigns (title)",
      { count: "exact" },
    )
    .eq("users_id", donorId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;

  const total = count ?? 0;
  return {
    rows: data,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

// Key diawali "transactions" agar ikut diperbarui saat transaksi dicek ulang (TRX005).
export default function useDonorTransactions(params: DonorTransactionsParams) {
  return useQuery({
    queryKey: ["transactions", { usersId: params.donorId, page: params.page }],
    queryFn: () => fetchDonorTransactions(params),
    placeholderData: keepPreviousData,
  });
}
