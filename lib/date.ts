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

const displayDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

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

/** `timestamptz` → teks tanggal dan jam WIB, contoh "10 Nov 2026, 14.05 WIB". */
export function formatDateTime(timestamp: string) {
  return `${displayDateTimeFormatter.format(new Date(timestamp))} WIB`;
}

/**
 * `timestamptz` → `Date` yang nilai UTC-nya sama dengan jam WIB. Untuk sel tanggal
 * Excel, yang tidak menyimpan zona waktu: sel menampilkan jam WIB apa adanya.
 */
export function toJakartaDateTime(timestamp: string) {
  return new Date(new Date(timestamp).getTime() + WIB_OFFSET_MS);
}
