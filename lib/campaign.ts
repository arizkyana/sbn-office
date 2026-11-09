import { Constants, type Enums } from "@/lib/supabase/database.types";

export type CampaignStatus = Enums<"campaign_status">;

export const CAMPAIGN_STATUSES = Constants.public.Enums.campaign_status;

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  PUBLISH: "Publish",
  ARCHIVED: "Arsip",
};

// Untuk `items` pada Select Base UI, agar trigger menampilkan label, bukan value.
export const campaignStatusOptions = CAMPAIGN_STATUSES.map((value) => ({
  value,
  label: campaignStatusLabel[value],
}));

/**
 * Persentase dana terkumpul terhadap target (0–100, dibulatkan ke bawah).
 * `null` bila campaign tidak punya target.
 */
export function getProgressPercent(collected: number, target: number | null) {
  if (!target) return null;
  return Math.min(100, Math.floor((collected / target) * 100));
}
