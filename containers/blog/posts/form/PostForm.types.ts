import { z } from "zod";
import { isEmptyHtml } from "@/lib/html";
import { POST_STATUSES, POST_TYPES } from "@/lib/post";
import { SLUG_FORMAT_MESSAGE, SLUG_PATTERN } from "@/lib/slug";
import { getYouTubeId } from "@/lib/youtube";

export const postSchema = z
  .object({
    type: z.enum(POST_TYPES),
    title: z
      .string()
      .trim()
      .min(1, "Judul wajib diisi")
      .max(120, "Judul maksimal 120 karakter"),
    slug: z
      .string()
      .min(1, "Slug wajib diisi")
      .regex(SLUG_PATTERN, SLUG_FORMAT_MESSAGE),
    // Value Select berupa string; diubah ke angka di action.
    categories_id: z.string().regex(/^\d+$/, "Kategori wajib dipilih"),
    description: z.string().trim().max(160, "Deskripsi maksimal 160 karakter"),
    content: z.string(),
    cover: z.union([z.literal(""), z.url("URL cover tidak valid")]),
    // Diabaikan (disimpan null) untuk artikel.
    video_url: z.string().trim(),
    status: z.enum(POST_STATUSES),
  })
  .superRefine((data, ctx) => {
    const isVideo = data.type === "VIDEO";

    // Constraint database: post video wajib punya video_url, juga saat DRAFT.
    if (isVideo && !data.video_url) {
      ctx.addIssue({
        code: "custom",
        path: ["video_url"],
        message: "URL video wajib diisi",
      });
    } else if (isVideo && !getYouTubeId(data.video_url)) {
      ctx.addIssue({
        code: "custom",
        path: ["video_url"],
        message: "Gunakan link video YouTube yang valid",
      });
    }

    if (data.status !== "PUBLISH") return;
    if (!data.description) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: "Deskripsi wajib diisi sebelum dipublikasikan",
      });
    }
    // Video: cover dan keterangan opsional (A3).
    if (isVideo) return;
    if (!data.cover) {
      ctx.addIssue({
        code: "custom",
        path: ["cover"],
        message: "Cover wajib diunggah sebelum dipublikasikan",
      });
    }
    if (isEmptyHtml(data.content)) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Konten wajib diisi sebelum dipublikasikan",
      });
    }
  });

export type PostInput = z.infer<typeof postSchema>;
