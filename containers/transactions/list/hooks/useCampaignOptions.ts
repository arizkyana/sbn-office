import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function fetchCampaignOptions() {
  const supabase = createClient();
  // Semua status, termasuk DRAFT dan ARCHIVED: transaksi lama tetap bisa disaring.
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, title")
    .order("title");
  if (error) throw error;

  // value berupa string: Select tidak bisa mencampur angka dengan sentinel "ALL".
  return data.map((campaign) => ({
    value: String(campaign.id),
    label: campaign.title,
  }));
}

/** Opsi filter campaign. Ikut diperbarui saat cache ["campaigns"] di-invalidate. */
export default function useCampaignOptions() {
  return useQuery({
    queryKey: ["campaigns", "options"],
    queryFn: fetchCampaignOptions,
  });
}
