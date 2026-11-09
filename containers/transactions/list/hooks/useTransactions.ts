import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { applyTransactionFilters } from "../filters";
import type { TransactionFilters } from "../TransactionList.types";

export const PAGE_SIZE = 20;

type TransactionListParams = {
  page: number;
  filters: TransactionFilters;
};

async function fetchTransactions({ page, filters }: TransactionListParams) {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;

  // Admin membaca semua baris lewat RLS (is_admin()), tanpa service role.
  const query = applyTransactionFilters(
    supabase
      .from("transactions")
      .select(
        "uuid, order_id, created_at, donor_name, donor_email, is_anonymous, amount, payment_method, payment_status, campaigns (title)",
        { count: "exact" },
      ),
    filters,
  );
  const { data, count, error } = await query
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

export type TransactionListItem = Awaited<
  ReturnType<typeof fetchTransactions>
>["rows"][number];

/** `enabled: false` selama filter tidak valid (contoh: rentang tanggal terbalik). */
export default function useTransactions(
  params: TransactionListParams,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["transactions", { page: params.page, ...params.filters }],
    queryFn: () => fetchTransactions(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}
