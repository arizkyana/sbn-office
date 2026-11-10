/** Bucket logo utama (migration sbn-supabase `create_site_assets_bucket`). */
export const LOGO_BUCKET = "site-assets";

/** Logo bawaan selama `settings.logo_url` kosong. Sama dengan sbn-donatur. */
export const DEFAULT_LOGO_SRC = "/logo-sbn.jpg";

/** Tag cache `getLogoSrc()` (lib/settings.ts), di-`updateTag()` setelah logo disimpan. */
export const LOGO_CACHE_TAG = "site-logo";

// Hasil crop: persegi, PNG agar latar transparan tetap transparan di favicon.
// 512 px cukup tajam untuk logo terbesar (pratinjau pengaturan) dan ikon tab.
export const LOGO_OUTPUT_SIZE = 512;
export const LOGO_OUTPUT_TYPE = "image/png";

const LOGO_URL_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${LOGO_BUCKET}/`;

/**
 * `true` hanya untuk URL publik bucket site-assets milik project ini (hasil
 * `uploadLogo`). Logo dipakai sebagai favicon dan `next/image`, jadi URL dari
 * situs lain ditolak saat disimpan maupun saat dibaca.
 */
export function isLogoUrl(src: string | undefined): src is string {
  return (
    typeof src === "string" &&
    src.startsWith(LOGO_URL_PREFIX) &&
    src.length > LOGO_URL_PREFIX.length &&
    // Tanpa ../ agar tidak keluar dari folder bucket.
    !src.includes("..")
  );
}
