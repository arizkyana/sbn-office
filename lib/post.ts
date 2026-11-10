import { Constants, type Enums } from "@/lib/supabase/database.types";
import { getYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

export type PostType = Enums<"post_type">;
export type PostStatus = Enums<"post_status">;

export const POST_TYPES = Constants.public.Enums.post_type;
export const POST_STATUSES = Constants.public.Enums.post_status;

export const postTypeLabel: Record<PostType, string> = {
  ARTICLE: "Artikel",
  VIDEO: "Video",
};

export const postStatusLabel: Record<PostStatus, string> = {
  DRAFT: "Draft",
  PUBLISH: "Publish",
};

// Untuk `items` pada Select Base UI, agar trigger menampilkan label, bukan value.
export const postTypeOptions = POST_TYPES.map((value) => ({
  value,
  label: postTypeLabel[value],
}));

export const postStatusOptions = POST_STATUSES.map((value) => ({
  value,
  label: postStatusLabel[value],
}));

/** Gambar post: cover, atau thumbnail YouTube untuk video tanpa cover (A3). */
export function getPostImage(post: {
  type: PostType;
  cover: string | null;
  video_url: string | null;
}) {
  if (post.cover) return post.cover;
  if (post.type !== "VIDEO" || !post.video_url) return null;

  const id = getYouTubeId(post.video_url);
  return id ? getYouTubeThumbnail(id) : null;
}
