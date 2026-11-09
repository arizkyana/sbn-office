import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// cache(): cukup satu query per request walau dipanggil lebih dari sekali.
export const getCampaignByUuid = cache(async (uuid: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      "uuid, title, slug, description, content, cover, start_date, end_date, target_budget, status",
    )
    .eq("uuid", uuid)
    .maybeSingle();
  if (error) throw error;
  return data;
});
