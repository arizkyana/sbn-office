"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isEmptyHtml } from "@/lib/html";
import { sanitizeRichText } from "@/lib/sanitize";
import { uploadImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { postSchema, type PostInput } from "./PostForm.types";

const INVALID_MESSAGE = "Periksa kembali data post";

// Tanpa uuid → tambah post baru; dengan uuid → ubah post tersebut.
export async function savePost(
  input: PostInput,
  uuid?: string,
): Promise<ActionResult<{ uuid: string }>> {
  const admin = await requireAdmin();

  const result = postSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  const { content, cover, description, video_url, categories_id, ...rest } =
    result.data;
  const isVideo = rest.type === "VIDEO";
  const html = sanitizeRichText(content);
  // Konten artikel yang kosong setelah disanitasi tidak boleh dipublikasikan.
  if (rest.status === "PUBLISH" && !isVideo && isEmptyHtml(html)) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: { content: ["Konten wajib diisi sebelum dipublikasikan"] },
    };
  }

  const values = {
    ...rest,
    categories_id: Number(categories_id),
    description: description || null,
    content: isEmptyHtml(html) ? null : html,
    cover: cover || null,
    video_url: isVideo ? video_url : null,
  };

  const supabase = await createClient();

  // published_at diisi saat pertama kali PUBLISH, lalu tidak berubah lagi walau
  // post diedit ulang atau dikembalikan ke DRAFT.
  let publishedAt: string | undefined;
  if (rest.status === "PUBLISH") {
    let isPublishedBefore = false;
    if (uuid) {
      const { data: existing, error } = await supabase
        .from("posts")
        .select("published_at")
        .eq("uuid", uuid)
        .maybeSingle();
      if (error) {
        return { success: false, message: "Post gagal disimpan. Coba lagi." };
      }
      if (!existing) return { success: false, message: "Post tidak ditemukan" };
      isPublishedBefore = existing.published_at !== null;
    }
    if (!isPublishedBefore) publishedAt = new Date().toISOString();
  }
  const row = publishedAt ? { ...values, published_at: publishedAt } : values;

  const { data, error } = uuid
    ? await supabase
        .from("posts")
        .update(row)
        .eq("uuid", uuid)
        .select("uuid")
        .maybeSingle()
    : await supabase
        .from("posts")
        .insert({ ...row, users_id: admin.id })
        .select("uuid")
        .single();

  if (error?.code === "23505") {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: { slug: ["Slug sudah dipakai post lain"] },
    };
  }
  // Kategori dihapus saat form masih terbuka.
  if (error?.code === "23503") {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: { categories_id: ["Kategori tidak ditemukan"] },
    };
  }
  if (error) {
    return { success: false, message: "Post gagal disimpan. Coba lagi." };
  }
  if (!data) return { success: false, message: "Post tidak ditemukan" };

  revalidatePath("/blog/posts");
  return { success: true, data: { uuid: data.uuid } };
}

// Dipanggil segera saat admin memilih file. File lama yang diganti tidak dihapus.
export async function uploadPostCover(
  file: File,
): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  return uploadImage("post-covers", file);
}

// Hapus permanen (A4). File cover di storage tidak ikut dihapus.
export async function deletePost(uuid: string): Promise<ActionResult> {
  await requireAdmin();

  if (!z.uuid().safeParse(uuid).success) {
    return { success: false, message: "Post tidak ditemukan" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("uuid", uuid)
    .select("uuid")
    .maybeSingle();
  if (error) {
    return { success: false, message: "Post gagal dihapus. Coba lagi." };
  }
  if (!data) return { success: false, message: "Post tidak ditemukan" };

  revalidatePath("/blog/posts");
  return { success: true };
}
