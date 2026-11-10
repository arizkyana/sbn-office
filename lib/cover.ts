// Sama dengan batas bucket campaign-covers dan post-covers (FND006).
export const COVER_MAX_SIZE = 2 * 1024 * 1024;

export const COVER_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Dipakai di client (sebelum upload) dan di server (`uploadImage`). */
export function getCoverFileError(file: unknown) {
  if (!(file instanceof Blob)) return "Pilih file gambar";
  if (!COVER_EXTENSIONS[file.type]) {
    return "Format cover harus JPG, PNG, atau WEBP";
  }
  if (file.size > COVER_MAX_SIZE) return "Ukuran cover maksimal 2 MB";
  return null;
}
