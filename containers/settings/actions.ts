"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isEmptyHtml } from "@/lib/html";
import { LOGO_BUCKET, LOGO_CACHE_TAG } from "@/lib/logo";
import { sanitizeRichText } from "@/lib/sanitize";
import { uploadImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import {
  logoSchema,
  PROFILE_EMPTY_MESSAGE,
  profileSchema,
  TERMS_EMPTY_MESSAGE,
  termsSchema,
  whatsappSchema,
  type ContentInput,
  type LogoInput,
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

// Action terpisah per kartu: satu kartu bisa disimpan tanpa memvalidasi kartu lain.

// Dipanggil segera setelah logo dipotong. File lama yang diganti tidak dihapus.
export async function uploadLogo(
  file: File,
): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  return uploadImage(LOGO_BUCKET, file);
}

export async function saveLogo(input: LogoInput): Promise<SaveResult> {
  await requireAdmin();

  const result = logoSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  const saved = await saveSetting("logo_url", result.data.logo_url);
  // Logo dan favicon office langsung berganti. Website donatur menyusul setelah
  // cache logonya kedaluwarsa (sbn-donatur/lib/settings.ts).
  if (saved.success) updateTag(LOGO_CACHE_TAG);
  return saved;
}

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
