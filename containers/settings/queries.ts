import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { SETTING_KEYS, type SettingKey } from "./Settings.types";

/** Nilai setiap pengaturan; string kosong bila belum diisi. */
export const getSettings = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", [...SETTING_KEYS]);
  if (error) throw error;

  const values = new Map(data.map((row) => [row.key, row.value]));
  return Object.fromEntries(
    SETTING_KEYS.map((key) => [key, values.get(key) ?? ""]),
  ) as Record<SettingKey, string>;
});
