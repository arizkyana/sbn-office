import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { escapeLike } from "@/lib/search";
import { createClient } from "@/lib/supabase/client";
import type { PostFilterValues } from "../PostList.types";

export const PAGE_SIZE = 10;

type PostListParams = PostFilterValues & { page: number };

async function fetchPosts({
  page,
  search,
  type,
  status,
  categoriesId,
}: PostListParams) {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;

  // Admin membaca DRAFT dan PUBLISH lewat RLS (is_admin()).
  let query = supabase
    .from("posts")
    .select(
      "uuid, title, type, status, cover, video_url, published_at, categories (name)",
      { count: "exact" },
    );
  if (search) query = query.ilike("title", `%${escapeLike(search)}%`);
  if (type !== "ALL") query = query.eq("type", type);
  if (status !== "ALL") query = query.eq("status", status);
  if (categoriesId !== "ALL") {
    query = query.eq("categories_id", Number(categoriesId));
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;

  const total = count ?? 0;
  return {
    rows: data,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type PostListItem = Awaited<
  ReturnType<typeof fetchPosts>
>["rows"][number];

export default function usePosts(params: PostListParams) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => fetchPosts(params),
    placeholderData: keepPreviousData,
  });
}
