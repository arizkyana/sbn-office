import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CampaignStatus } from "@/lib/campaign";
import { createClient } from "@/lib/supabase/client";

export const PAGE_SIZE = 10;

export type CampaignStatusFilter = CampaignStatus | "ALL";

type CampaignListParams = {
  page: number;
  search: string;
  status: CampaignStatusFilter;
};

// % dan _ dari input dicari apa adanya, bukan sebagai wildcard ilike.
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

async function fetchCampaigns({ page, search, status }: CampaignListParams) {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("campaigns")
    .select("id, uuid, title, cover, status, target_budget, end_date", {
      count: "exact",
    });
  if (search) query = query.ilike("title", `%${escapeLike(search)}%`);
  if (status !== "ALL") query = query.eq("status", status);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;

  // View campaign_progress tidak terdeteksi sebagai relasi, jadi dibaca dengan query kedua.
  const collected = new Map<number, number>();
  if (data.length > 0) {
    const { data: progress, error: progressError } = await supabase
      .from("campaign_progress")
      .select("campaigns_id, collected_amount")
      .in(
        "campaigns_id",
        data.map((campaign) => campaign.id),
      );
    if (progressError) throw progressError;

    progress.forEach((row) => {
      if (row.campaigns_id !== null) {
        collected.set(row.campaigns_id, row.collected_amount ?? 0);
      }
    });
  }

  const total = count ?? 0;
  return {
    rows: data.map((campaign) => ({
      ...campaign,
      collected: collected.get(campaign.id) ?? 0,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type CampaignListItem = Awaited<
  ReturnType<typeof fetchCampaigns>
>["rows"][number];

export default function useCampaigns(params: CampaignListParams) {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () => fetchCampaigns(params),
    placeholderData: keepPreviousData,
  });
}
