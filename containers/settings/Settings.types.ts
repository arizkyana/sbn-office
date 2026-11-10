import { z } from "zod";
import { isEmptyHtml } from "@/lib/html";
import { isLogoUrl } from "@/lib/logo";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";

/** Baris tabel settings (data awal FND007, `logo_url` dari migration site-assets). */
export const SETTING_KEYS = [
  "logo_url",
  "whatsapp_number",
  "terms_and_conditions",
  "company_profile",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const logoSchema = z.object({
  // Kosong: aplikasi kembali memakai logo bawaan.
  logo_url: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isLogoUrl(value),
      "Unggah logo lewat tombol Ganti logo",
    ),
});

export type LogoInput = z.infer<typeof logoSchema>;

export const whatsappSchema = z.object({
  whatsapp_number: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi")
    // Disimpan dalam format wa.me: 62… tanpa "+".
    .transform((value, ctx) => {
      const normalized = normalizeWhatsappNumber(value);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "Gunakan nomor HP, contoh 081234567890",
        });
        return z.NEVER;
      }
      return normalized;
    }),
});

export type WhatsappInput = z.input<typeof whatsappSchema>;

export const TERMS_EMPTY_MESSAGE = "Syarat & Ketentuan wajib diisi";
export const PROFILE_EMPTY_MESSAGE = "Profil Lembaga wajib diisi";

function createContentSchema(emptyMessage: string) {
  return z.object({
    content: z.string().refine((value) => !isEmptyHtml(value), emptyMessage),
  });
}

export const termsSchema = createContentSchema(TERMS_EMPTY_MESSAGE);
export const profileSchema = createContentSchema(PROFILE_EMPTY_MESSAGE);

export type ContentInput = z.infer<typeof termsSchema>;
