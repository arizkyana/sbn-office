"use server";

import { requireAdmin } from "@/lib/auth";
import { CONTENT_IMAGE_BUCKET } from "@/lib/content-image";
import { uploadImage } from "@/lib/storage";
import type { ActionResult } from "@/lib/types";

/**
 * Upload gambar di dalam konten editor ke bucket content-images. Dipanggil
 * `handleImageUpload` (components/editor/image-upload.ts) setelah gambar
 * diperkecil di browser. File yang dihapus dari konten tidak ikut dihapus.
 */
export async function uploadEditorImage(
  file: File,
): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  return uploadImage(CONTENT_IMAGE_BUCKET, file);
}
