// Nomor HP Indonesia dalam format internasional tanpa `+`: 62 lalu 8 dan 8–12
// digit (total 11–15 digit, batas E.164).
const WHATSAPP_NUMBER_PATTERN = /^628\d{8,12}$/;

/**
 * Normalisasi nomor WhatsApp ke format yang dipakai `wa.me`, contoh
 * "0812-3456-7890" → "6281234567890". Menerima awalan `0`, `62`, atau `+62`,
 * dengan spasi, tanda hubung, titik, atau kurung. `null` bila bukan nomor HP
 * Indonesia yang valid.
 */
export function normalizeWhatsappNumber(input: string) {
  const cleaned = input.replace(/[\s\-.()]/g, "");
  const normalized = cleaned.replace(/^(?:\+62|62|0)/, "62");
  // Awalan selain 0/62/+62 tidak diganti, sehingga gagal di pola berikut.
  return WHATSAPP_NUMBER_PATTERN.test(normalized) ? normalized : null;
}
