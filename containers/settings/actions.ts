"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isEmptyHtml } from "@/lib/html";
import { sanitizeRichText } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import {
  PROFILE_EMPTY_MESSAGE,
  profileSchema,
  TERMS_EMPTY_MESSAGE,
  termsSchema,
  whatsappSchema,
  type ContentInput,
  type SettingKey,
  type WhatsappInput,
} from "./Settings.types";

const INVALID_MESSAGE = "Periksa kembali isian pengaturan";

/** Nilai yang benar-benar tersimpan, agar form menampilkan hasil normalisasi/sanitasi. */
type SaveResult = ActionResult<{ value: string }>;

async function saveSetting(
  key: SettingKey,
  value: string,
): Promise<SaveResult> {
  const supabase = await createClient();
  // upsert: baris awal (FND007) dibuat ulang bila terhapus. RLS hanya admin.
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) {
    return { success: false, message: "Pengaturan gagal disimpan. Coba lagi." };
  }

  revalidatePath("/settings");
  return { success: true, data: { value } };
}

async function saveContent(
  key: SettingKey,
  schema: typeof termsSchema,
  input: ContentInput,
  emptyMessage: string,
): Promise<SaveResult> {
  const result = schema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  const html = sanitizeRichText(result.data.content);
  // Konten yang kosong setelah disanitasi (misalnya hanya <script>) ditolak.
  if (isEmptyHtml(html)) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: { content: [emptyMessage] },
    };
  }
  return saveSetting(key, html);
}

// Tiga action terpisah: satu kartu bisa disimpan tanpa memvalidasi kartu lain.

export async function saveWhatsapp(input: WhatsappInput): Promise<SaveResult> {
  await requireAdmin();

  const result = whatsappSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }
  return saveSetting("whatsapp_number", result.data.whatsapp_number);
}

export async function saveTerms(input: ContentInput): Promise<SaveResult> {
  await requireAdmin();
  return saveContent(
    "terms_and_conditions",
    termsSchema,
    input,
    TERMS_EMPTY_MESSAGE,
  );
}

export async function saveCompanyProfile(
  input: ContentInput,
): Promise<SaveResult> {
  await requireAdmin();
  return saveContent(
    "company_profile",
    profileSchema,
    input,
    PROFILE_EMPTY_MESSAGE,
  );
}
