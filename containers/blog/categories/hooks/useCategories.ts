import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function fetchCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, uuid, name, alias")
    .order("name");
  if (error) throw error;

  // Jumlah kategori sedikit: satu query count per kategori, sehingga tidak
  // terkena batas 1.000 baris seperti bila semua post dibaca lalu dihitung.
  const postCounts = await Promise.all(
    data.map(async (category) => {
      const { count, error: countError } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("categories_id", category.id);
      if (countError) throw countError;
      return count ?? 0;
    }),
  );

  return data.map((category, index) => ({
    ...category,
    postCount: postCounts[index],
  }));
}

export type CategoryListItem = Awaited<
  ReturnType<typeof fetchCategories>
>[number];

export default function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
}
