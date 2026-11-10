import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_LOGO_SRC, isLogoUrl, LOGO_CACHE_TAG } from "@/lib/logo";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Logo utama dari `settings.logo_url` untuk sidebar, halaman login, dan favicon
 * (root layout), atau logo bawaan bila kosong.
 *
 * Berbeda dengan pengaturan lain, logo di-cache agar tetap ikut kerangka statis
 * setiap halaman dan favicon ada di `<head>`. `saveLogo()` memanggil
 * `updateTag()`, jadi perubahan langsung terlihat di office.
 */
export async function getLogoSrc() {
  "use cache";
  cacheLife("minutes");
  cacheTag(LOGO_CACHE_TAG);

  const { data, error } = await createPublicClient()
    .from("settings")
    .select("value")
    .eq("key", "logo_url")
    .maybeSingle();
  // Logo gagal dibaca tidak boleh menggagalkan halaman: pakai logo bawaan.
  if (error) {
    console.error("Logo gagal dibaca", error);
    return DEFAULT_LOGO_SRC;
  }

  const url = data?.value.trim();
  return isLogoUrl(url) ? url : DEFAULT_LOGO_SRC;
}
