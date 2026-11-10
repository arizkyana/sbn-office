import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function fetchCategoryOptions() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (error) throw error;

  // value berupa string sesuai value Select (dan categories_id di form post).
  return data.map((category) => ({
    value: String(category.id),
    label: category.name,
  }));
}

/**
 * Opsi kategori untuk form dan filter post. Ikut diperbarui saat cache
 * ["categories"] di-invalidate setelah kategori disimpan atau dihapus.
 */
export default function useCategoryOptions() {
  return useQuery({
    queryKey: ["categories", "options"],
    queryFn: fetchCategoryOptions,
  });
}
