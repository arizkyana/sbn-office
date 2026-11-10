"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { categorySchema, type CategoryInput } from "./CategoryList.types";

const INVALID_MESSAGE = "Periksa kembali data kategori";

// Tanpa uuid → tambah kategori baru; dengan uuid → ubah kategori tersebut.
export async function saveCategory(
  input: CategoryInput,
  uuid?: string,
): Promise<ActionResult<{ uuid: string }>> {
  await requireAdmin();

  const result = categorySchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = uuid
    ? await supabase
        .from("categories")
        .update(result.data)
        .eq("uuid", uuid)
        .select("uuid")
        .maybeSingle()
    : await supabase
        .from("categories")
        .insert(result.data)
        .select("uuid")
        .single();

  if (error?.code === "23505") {
    return {
      success: false,
      message: INVALID_MESSAGE,
      fieldErrors: { alias: ["Alias sudah dipakai kategori lain"] },
    };
  }
  if (error) {
    return { success: false, message: "Kategori gagal disimpan. Coba lagi." };
  }
  if (!data) return { success: false, message: "Kategori tidak ditemukan" };

  revalidatePath("/blog/categories");
  return { success: true, data: { uuid: data.uuid } };
}

export async function deleteCategory(uuid: string): Promise<ActionResult> {
  await requireAdmin();

  if (!z.uuid().safeParse(uuid).success) {
    return { success: false, message: "Kategori tidak ditemukan" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("uuid", uuid)
    .select("uuid")
    .maybeSingle();

  // posts.categories_id memakai on delete restrict.
  if (error?.code === "23503") {
    return {
      success: false,
      message:
        "Kategori masih dipakai oleh post. Pindahkan post ke kategori lain terlebih dahulu.",
    };
  }
  if (error) {
    return { success: false, message: "Kategori gagal dihapus. Coba lagi." };
  }
  if (!data) return { success: false, message: "Kategori tidak ditemukan" };

  revalidatePath("/blog/categories");
  return { success: true };
}
