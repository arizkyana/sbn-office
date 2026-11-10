/** Format slug/alias yang valid: huruf kecil dan angka, dipisah `-`. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_FORMAT_MESSAGE =
  "Gunakan huruf kecil, angka, dan tanda - di antara kata";

/**
 * Mengubah teks menjadi slug URL: huruf kecil, karakter selain huruf/angka
 * diganti `-`, tanpa `-` berulang atau di ujung. Huruf beraksen dinormalisasi
 * dulu (contoh: "é" → "e").
 */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
