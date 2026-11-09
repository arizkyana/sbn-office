// Semua tanggal campaign memakai zona Asia/Jakarta (WIB).
const TIME_ZONE = "Asia/Jakarta";

// Locale en-CA menghasilkan format YYYY-MM-DD, sesuai nilai <input type="date">.
const inputDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const displayDateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  dateStyle: "medium",
});

/** Tanggal hari ini di Asia/Jakarta, format `YYYY-MM-DD`. */
export function todayInJakarta() {
  return inputDateFormatter.format(new Date());
}

/** `timestamptz` → tanggal Asia/Jakarta `YYYY-MM-DD`. */
export function toJakartaDate(timestamp: string) {
  return inputDateFormatter.format(new Date(timestamp));
}

/** `YYYY-MM-DD` → awal hari tersebut di Asia/Jakarta. */
export function startOfDayJakarta(date: string) {
  return `${date}T00:00:00+07:00`;
}

/** `YYYY-MM-DD` → akhir hari tersebut di Asia/Jakarta. */
export function endOfDayJakarta(date: string) {
  return `${date}T23:59:59+07:00`;
}

/** `timestamptz` → teks tanggal, contoh "10 Nov 2026". */
export function formatDate(timestamp: string) {
  return displayDateFormatter.format(new Date(timestamp));
}
