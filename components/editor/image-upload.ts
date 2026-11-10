import type { Editor } from "@tiptap/react";
import { isContentImageUrl } from "@/lib/content-image";
import { getCoverFileError, getCoverSourceError } from "@/lib/cover";
import { resizeImage } from "@/lib/image-processing";
import type { ActionResult } from "@/lib/types";

/** Server Action upload gambar yang mengembalikan URL publik, contoh `uploadEditorImage`. */
export type ImageUploader = (
  file: File,
) => Promise<ActionResult<{ url: string }>>;

type HandleImageUploadOptions = {
  /** Instance editor Tiptap. */
  editor: Editor;
  /** File dari tombol "Gambar", clipboard (paste), atau drag-drop. */
  file: File;
  /** Server Action upload, contoh `uploadEditorImage` (components/editor/actions.ts). */
  upload: ImageUploader;
  /** Posisi drop. Tanpa ini, gambar disisipkan di posisi kursor. */
  position?: number;
};

/**
 * Handler upload gambar di editor, padanan `modules.toolbar.handlers.image`
 * di Quill. Dipakai tombol "Gambar" di toolbar, paste, dan drag-drop.
 *
 * Mengembalikan pesan error untuk ditampilkan, atau `null` bila gambar
 * berhasil disisipkan.
 */
export async function handleImageUpload({
  editor,
  file,
  upload,
  position,
}: HandleImageUploadOptions): Promise<string | null> {
  // Posisi dicatat sebelum upload (seperti `quill.getSelection().index`),
  // karena kursor bisa berpindah selama menunggu.
  const insertAt = position ?? editor.state.selection.from;

  // 1. Validasi file asli: JPG/PNG/WEBP, maksimal 10 MB.
  const sourceError = getCoverSourceError(file);
  if (sourceError) return sourceError;

  // 2. Perkecil di browser (lebar maksimal 1600 px, JPEG) agar di bawah
  //    batas bucket 2 MB.
  const objectUrl = URL.createObjectURL(file);
  let resized: File;
  try {
    const blob = await resizeImage(objectUrl);
    resized = new File([blob], "image.jpg", { type: blob.type });
  } catch {
    return "Gambar gagal diproses. Coba pilih gambar lain.";
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  if (getCoverFileError(resized)) {
    return "Gambar masih terlalu besar setelah diperkecil. Coba gambar lain.";
  }

  // 3. Upload lewat Server Action → URL publik bucket content-images.
  let result;
  try {
    result = await upload(resized);
  } catch {
    return "Gambar gagal diunggah. Coba lagi.";
  }
  // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
  if (!result) return null;
  if (!result.success) return result.message;
  if (!result.data) return "Gambar gagal diunggah. Coba lagi.";

  // 4. Sisipkan <img> di posisi yang dicatat, dibatasi ke ukuran dokumen
  //    saat ini (isi editor bisa berubah selama upload).
  if (editor.isDestroyed) return null;
  editor
    .chain()
    .focus()
    .insertContentAt(Math.min(insertAt, editor.state.doc.content.size), {
      type: "image",
      attrs: { src: result.data.url, alt: getAltText(file.name) },
    })
    .run();
  return null;
}

/** Teks alternatif dari nama file, contoh "foto-kegiatan_01.jpg" → "foto kegiatan 01". */
function getAltText(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

/**
 * Membuang gambar dari situs lain saat HTML ditempel (contoh menyalin artikel
 * web), agar editor tidak menampilkan gambar yang nanti dibuang sanitizer.
 */
export function removeForeignImages(html: string) {
  if (!/<img\s/i.test(html)) return html;

  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("img").forEach((image) => {
    if (!isContentImageUrl(image.getAttribute("src") ?? undefined)) {
      image.remove();
    }
  });
  return document.body.innerHTML;
}
