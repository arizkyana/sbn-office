/**
 * URL halaman di website donatur (sbn-donatur), contoh `getDonaturUrl("/tentang")`.
 * `null` bila `NEXT_PUBLIC_DONATUR_URL` belum diatur, agar link bisa disembunyikan.
 */
export function getDonaturUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_DONATUR_URL;
  return baseUrl ? new URL(path, baseUrl).toString() : null;
}
