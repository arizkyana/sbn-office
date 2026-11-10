"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { endOfDayJakarta, startOfDayJakarta } from "@/lib/date";
import { isEmptyHtml } from "@/lib/html";
import { sanitizeRichText } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { uploadImage } from "@/lib/storage";
import { campaignSchema, type CampaignInput } from "./CampaignForm.types";

const INVALID_MESSAGE = "Periksa kembali data campaign";

// Tanpa uuid → tambah campaign baru; dengan uuid → ubah campaign tersebut.
export async function saveCampaign(
  input: CampaignInput,
  uuid?: string,
): Promise<ActionResult<{ uuid: string }>> {
  const admin = await requireAdmin();

  const result = campaignSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  const { content, cover, description, start_date, end_date, ...rest } =
    result.data;
  const html = sanitizeRichText(content);
  // Konten yang kosong setelah disanitasi (misalnya hanya <script>) tidak boleh dipublikasikan.
  if (rest.status === "PUBLISH" && isEmptyHtml(html)) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: { content: ["Konten wajib diisi sebelum dipublikasikan"] },
    };
  }

  const values = {
    ...rest,
    description: description || null,
    content: isEmptyHtml(html) ? null : html,
    cover: cover || null,
    start_date: startOfDayJakarta(start_date),
    end_date: end_date ? endOfDayJakarta(end_date) : null,
  };

  const supabase = await createClient();
  const { data, error } = uuid
    ? await supabase
        .from("campaigns")
        .update(values)
        .eq("uuid", uuid)
        .select("uuid")
        .maybeSingle()
    : await supabase
        .from("campaigns")
        .insert({ ...values, users_id: admin.id })
        .select("uuid")
        .single();

  if (error?.code === "23505") {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: { slug: ["Slug sudah dipakai campaign lain"] },
    };
  }
  if (error) {
    return { success: false, message: "Campaign gagal disimpan. Coba lagi." };
  }
  if (!data) return { success: false, message: "Campaign tidak ditemukan" };

  revalidatePath("/campaigns");
  return { success: true, data: { uuid: data.uuid } };
}

// Dipanggil segera saat admin memilih file. File lama yang diganti tidak dihapus.
export async function uploadCover(
  file: File,
): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  return uploadImage("campaign-covers", file);
}
