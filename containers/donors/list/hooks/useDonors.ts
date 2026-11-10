import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { buildIlikeOrFilter } from "@/lib/search";
import { createClient } from "@/lib/supabase/client";
import type { DonorStatusFilter } from "../DonorList.types";

export const PAGE_SIZE = 20;

type DonorListParams = {
  page: number;
  search: string;
  status: DonorStatusFilter;
};

async function fetchDonors({ page, search, status }: DonorListParams) {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;

  // Admin membaca semua profil lewat RLS (is_admin()). Email dari profiles.email
  // (AKN001), karena auth.users tidak bisa dibaca lewat API.
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active, created_at", {
      count: "exact",
    })
    .eq("role", "DONATUR");
  if (status !== "ALL") query = query.eq("is_active", status === "ACTIVE");
  const searchFilter = buildIlikeOrFilter(
    ["full_name", "email", "phone"],
    search,
  );
  if (searchFilter) query = query.or(searchFilter);

  // id sebagai pengurut terakhir agar .range() stabil antar halaman.
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

export type DonorListItem = Awaited<
  ReturnType<typeof fetchDonors>
>["rows"][number];

export default function useDonors(params: DonorListParams) {
  return useQuery({
    queryKey: ["donors", params],
    queryFn: () => fetchDonors(params),
    placeholderData: keepPreviousData,
  });
}
