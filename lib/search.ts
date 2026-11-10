// Helper pencarian `ilike` yang dipakai bersama daftar campaign, transaksi, dan donatur.
// Tanpa `server-only`: dipakai di client (daftar) dan server (export).

/** Escape `%`, `_`, dan `\` agar dicari apa adanya, bukan sebagai wildcard ilike. */
export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Filter `.or()` PostgREST: `ilike` kata kunci di beberapa kolom. `,` `(` `)`
 * dibuang karena menjadi pemisah sintaks filter di dalam `.or()`. Mengembalikan
 * `null` bila kata kunci kosong setelah dibersihkan.
 */
export function buildIlikeOrFilter(
  columns: string[],
  search: string | undefined,
) {
  const keyword = search?.replace(/[,()]/g, "").trim();
  if (!keyword) return null;

  const pattern = `%${escapeLike(keyword)}%`;
  return columns.map((column) => `${column}.ilike.${pattern}`).join(",");
}
