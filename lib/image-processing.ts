import {
  COVER_ASPECT,
  COVER_OUTPUT_QUALITY,
  COVER_OUTPUT_TYPE,
  COVER_OUTPUT_WIDTH,
} from "@/lib/cover";
import { LOGO_OUTPUT_SIZE, LOGO_OUTPUT_TYPE } from "@/lib/logo";

// Khusus browser: memakai Image dan canvas. Dipakai crop cover dan logo
// (ImageCropDialog) serta gambar di dalam konten editor
// (components/editor/image-upload.ts).

type Area = { x: number; y: number; width: number; height: number };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar gagal dimuat"));
    image.src = src;
  });
}

/**
 * Menggambar `area` dari gambar ke canvas berukuran `width × height`, lalu
 * mengubahnya ke `type` (bawaan JPEG).
 */
function drawToBlob(
  image: HTMLImageElement,
  area: Area,
  width: number,
  height: number,
  type = COVER_OUTPUT_TYPE,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas tidak didukung browser ini");

  // JPEG tidak punya transparansi: tanpa latar putih, PNG transparan jadi hitam.
  if (type === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    width,
    height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Gambar gagal diproses")),
      type,
      COVER_OUTPUT_QUALITY,
    );
  });
}

/**
 * Memotong area crop (piksel gambar asli) menjadi JPEG 16:9 dengan lebar
 * maksimal `COVER_OUTPUT_WIDTH`. Gambar yang lebih kecil tidak diperbesar.
 */
export async function cropImage(src: string, area: Area) {
  const image = await loadImage(src);
  const width = Math.round(Math.min(area.width, COVER_OUTPUT_WIDTH));
  const height = Math.round(width / COVER_ASPECT);
  return drawToBlob(image, area, width, height);
}

/**
 * Memotong area crop persegi menjadi PNG dengan sisi maksimal
 * `LOGO_OUTPUT_SIZE`. Latar transparan dipertahankan, dan gambar yang lebih
 * kecil tidak diperbesar.
 */
export async function cropLogo(src: string, area: Area) {
  const image = await loadImage(src);
  const size = Math.round(Math.min(area.width, LOGO_OUTPUT_SIZE));
  return drawToBlob(image, area, size, size, LOGO_OUTPUT_TYPE);
}

/**
 * Memperkecil gambar utuh (rasio asli) menjadi JPEG dengan lebar maksimal
 * `COVER_OUTPUT_WIDTH`. Gambar yang lebih kecil tidak diperbesar.
 */
export async function resizeImage(src: string) {
  const image = await loadImage(src);
  const { naturalWidth, naturalHeight } = image;
  const width = Math.min(naturalWidth, COVER_OUTPUT_WIDTH);
  const height = Math.round((naturalHeight * width) / naturalWidth);
  const area = { x: 0, y: 0, width: naturalWidth, height: naturalHeight };
  return drawToBlob(image, area, width, height);
}
