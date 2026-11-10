import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// cache(): cukup satu query per request walau dipanggil lebih dari sekali.
export const getPostByUuid = cache(async (uuid: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "uuid, type, title, slug, categories_id, description, content, cover, video_url, status",
    )
    .eq("uuid", uuid)
    .maybeSingle();
  if (error) throw error;
  return data;
});
