import { endOfDayJakarta, startOfDayJakarta } from "@/lib/date";
import { escapeLike } from "@/lib/utils";
import {
  transactionFilterSchema,
  type TransactionFilterValues,
  type TransactionFilters,
} from "./TransactionList.types";

// Dipakai di client (daftar) dan server (export), jadi tanpa "server-only".

/** Nilai field filter → filter tervalidasi. Gagal bila rentang tanggal terbalik. */
export function parseTransactionFilters(values: TransactionFilterValues) {
  return transactionFilterSchema.safeParse({
    search: values.search || undefined,
    status: values.status === "ALL" ? undefined : values.status,
    campaignsId: values.campaignsId === "ALL" ? undefined : values.campaignsId,
    from: values.from || undefined,
    to: values.to || undefined,
  });
}

// Bentuk minimal query builder Supabase yang dibutuhkan, agar daftar dan export
// yang memilih kolom berbeda bisa memakai fungsi yang sama.
type FilterableQuery<Query> = {
  eq(column: string, value: unknown): Query;
  gte(column: string, value: unknown): Query;
  lte(column: string, value: unknown): Query;
  or(filters: string): Query;
};

/**
 * Menambahkan filter ke query `transactions`. Satu fungsi untuk daftar (TRX003)
 * dan export (TRX006), agar jumlah barisnya selalu sama.
 */
export function applyTransactionFilters<Query extends FilterableQuery<Query>>(
  query: Query,
  filters: TransactionFilters,
) {
  let filtered = query;
  if (filters.status) filtered = filtered.eq("payment_status", filters.status);
  if (filters.campaignsId) {
    filtered = filtered.eq("campaigns_id", filters.campaignsId);
  }
  if (filters.from) {
    filtered = filtered.gte("created_at", startOfDayJakarta(filters.from));
  }
  if (filters.to) {
    filtered = filtered.lte("created_at", endOfDayJakarta(filters.to));
  }

  // , ( ) adalah pemisah sintaks filter PostgREST di dalam .or().
  const search = filters.search?.replace(/[,()]/g, "").trim();
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    filtered = filtered.or(
      ["order_id", "donor_name", "donor_email"]
        .map((column) => `${column}.ilike.${pattern}`)
        .join(","),
    );
  }
  return filtered;
}

/** Query string untuk link export (`/transactions/export?...`). */
export function buildTransactionFilterParams(filters: TransactionFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params;
}
