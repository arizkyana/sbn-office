import { z } from "zod";
import { isEmptyHtml } from "@/lib/html";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";

/** Baris tabel settings (data awal FND007). */
export const SETTING_KEYS = [
  "whatsapp_number",
  "terms_and_conditions",
  "company_profile",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

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
