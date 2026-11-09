import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Ringkasan seluruh transaksi SUCCESS (view dashboard_summary, mengikuti RLS). */
export const getDashboardSummary = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dashboard_summary")
    .select("total_collected, success_count, donor_count")
    .single();
  if (error) throw error;

  return {
    totalCollected: data.total_collected ?? 0,
    successCount: data.success_count ?? 0,
    donorCount: data.donor_count ?? 0,
  };
});

/** Semua campaign beserta dana terkumpul, urut dari yang terbesar. */
export const getCampaignSummaries = cache(async () => {
  const supabase = await createClient();
  // View campaign_progress tidak terdeteksi sebagai relasi, jadi dibaca dengan query kedua.
  const [campaignsResult, progressResult] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, uuid, title, status, target_budget, end_date"),
    supabase
      .from("campaign_progress")
      .select("campaigns_id, collected_amount, donor_count"),
  ]);
  if (campaignsResult.error) throw campaignsResult.error;
  if (progressResult.error) throw progressResult.error;

  const progressByCampaign = new Map(
    progressResult.data.map((row) => [row.campaigns_id, row]),
  );

  return campaignsResult.data
    .map((campaign) => {
      const progress = progressByCampaign.get(campaign.id);
      return {
        ...campaign,
        collected: progress?.collected_amount ?? 0,
        // donor_count di campaign_progress = jumlah transaksi SUCCESS.
        successCount: progress?.donor_count ?? 0,
      };
    })
    .sort(
      (a, b) => b.collected - a.collected || a.title.localeCompare(b.title),
    );
});

export type CampaignSummary = Awaited<
  ReturnType<typeof getCampaignSummaries>
>[number];
