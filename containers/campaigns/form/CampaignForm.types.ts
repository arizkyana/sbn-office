import { z } from "zod";
import { CAMPAIGN_STATUSES } from "@/lib/campaign";
import { isEmptyHtml } from "@/lib/html";

// Sama dengan batas bucket campaign-covers (FND006).
export const COVER_MAX_SIZE = 2 * 1024 * 1024;

export const COVER_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Dipakai di client (sebelum upload) dan di server (`uploadCover`). */
export function getCoverFileError(file: unknown) {
  if (!(file instanceof Blob)) return "Pilih file gambar";
  if (!COVER_EXTENSIONS[file.type]) {
    return "Format cover harus JPG, PNG, atau WEBP";
  }
  if (file.size > COVER_MAX_SIZE) return "Ukuran cover maksimal 2 MB";
  return null;
}

const dateSchema = z.iso.date("Format tanggal tidak valid");

export const campaignSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul wajib diisi")
      .max(120, "Judul maksimal 120 karakter"),
    slug: z
      .string()
      .min(1, "Slug wajib diisi")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Gunakan huruf kecil, angka, dan tanda - di antara kata",
      ),
    description: z
      .string()
      .trim()
      .max(160, "Deskripsi maksimal 160 karakter"),
    content: z.string(),
    cover: z.union([z.literal(""), z.url("URL cover tidak valid")]),
    start_date: z.string().min(1, "Tanggal mulai wajib diisi").pipe(dateSchema),
    end_date: z.union([z.literal(""), dateSchema]),
    target_budget: z
      .number("Target harus berupa angka")
      .int("Target harus bilangan bulat")
      .positive("Target harus lebih dari 0")
      .nullable(),
    status: z.enum(CAMPAIGN_STATUSES),
  })
  .superRefine((data, ctx) => {
    if (data.end_date && data.end_date < data.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Tanggal berakhir tidak boleh sebelum tanggal mulai",
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

export type CampaignInput = z.infer<typeof campaignSchema>;
