import { z } from "zod";
import { SLUG_FORMAT_MESSAGE, SLUG_PATTERN } from "@/lib/slug";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(50, "Nama maksimal 50 karakter"),
  alias: z
    .string()
    .min(1, "Alias wajib diisi")
    .max(50, "Alias maksimal 50 karakter")
    .regex(SLUG_PATTERN, SLUG_FORMAT_MESSAGE),
});

export type CategoryInput = z.infer<typeof categorySchema>;
