export { cn } from "cn";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number) {
  return rupiahFormatter.format(amount);
}

/** Escape `%`, `_`, dan `\` agar dicari apa adanya, bukan sebagai wildcard ilike. */
export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
