/** Bucket gambar di dalam konten editor (migration sbn-supabase `create_content_images_bucket`). */
export const CONTENT_IMAGE_BUCKET = "content-images";

const CONTENT_IMAGE_URL_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${CONTENT_IMAGE_BUCKET}/`;

/**
 * `true` hanya untuk URL publik bucket content-images milik project ini.
 * Dipakai sanitizer (server) dan editor (saat paste HTML) agar konten tidak
 * memuat gambar dari situs lain (hotlink, tracking pixel) atau `data:` base64.
 */
export function isContentImageUrl(src: string | undefined) {
  return (
    typeof src === "string" &&
    src.startsWith(CONTENT_IMAGE_URL_PREFIX) &&
    src.length > CONTENT_IMAGE_URL_PREFIX.length &&
    // Tanpa ../ agar tidak keluar dari folder bucket.
    !src.includes("..")
  );
}
