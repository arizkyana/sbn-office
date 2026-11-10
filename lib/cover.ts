// Sama dengan batas bucket campaign-covers dan post-covers (FND006).
export const COVER_MAX_SIZE = 2 * 1024 * 1024;

export const COVER_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// File asli boleh lebih besar dari batas bucket karena dipotong dan dikompres
// di browser (lib/crop-image.ts) sebelum diunggah.
export const COVER_SOURCE_MAX_SIZE = 10 * 1024 * 1024;

export const COVER_ASPECT = 16 / 9;

/** Lebar maksimal hasil crop; tingginya mengikuti rasio 16:9 (1600×900). */
export const COVER_OUTPUT_WIDTH = 1600;
export const COVER_OUTPUT_TYPE = "image/jpeg";
export const COVER_OUTPUT_QUALITY = 0.85;

/** Validasi file asli yang dipilih admin, sebelum dibuka di dialog crop. */
export function getCoverSourceError(file: File) {
  if (!COVER_EXTENSIONS[file.type]) {
    return "Format gambar harus JPG, PNG, atau WEBP";
  }
  if (file.size > COVER_SOURCE_MAX_SIZE) return "Ukuran gambar maksimal 10 MB";
  return null;
}

/**
 * Validasi file yang diunggah (hasil crop). Dipakai di client (sebelum upload)
 * dan di server (`uploadImage`).
 */
export function getCoverFileError(file: unknown) {
  if (!(file instanceof Blob)) return "Pilih file gambar";
  if (!COVER_EXTENSIONS[file.type]) {
    return "Format cover harus JPG, PNG, atau WEBP";
  }
  if (file.size > COVER_MAX_SIZE) return "Ukuran cover maksimal 2 MB";
  return null;
}
