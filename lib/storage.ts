import "server-only";

import { COVER_EXTENSIONS, getCoverFileError } from "@/lib/cover";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

export type ImageBucket = "campaign-covers" | "post-covers" | "content-images";

/**
 * Upload gambar ke bucket publik dengan nama acak, lalu kembalikan URL publiknya.
 * Tidak memeriksa admin: Server Action pemanggilnya wajib memanggil
 * `requireAdmin()` lebih dulu. File lama yang diganti tidak dihapus.
 */
export async function uploadImage(
  bucketName: ImageBucket,
  file: File,
): Promise<ActionResult<{ url: string }>> {
  const fileError = getCoverFileError(file);
  if (fileError) return { success: false, message: fileError };

  const supabase = await createClient();
  const bucket = supabase.storage.from(bucketName);
  const path = `${crypto.randomUUID()}.${COVER_EXTENSIONS[file.type]}`;
  const { error } = await bucket.upload(path, file, {
    contentType: file.type,
  });
  if (error) {
    return { success: false, message: "Cover gagal diunggah. Coba lagi." };
  }

  const { data } = bucket.getPublicUrl(path);
  return { success: true, data: { url: data.publicUrl } };
}
