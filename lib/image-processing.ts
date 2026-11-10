import {
  COVER_ASPECT,
  COVER_OUTPUT_QUALITY,
  COVER_OUTPUT_TYPE,
  COVER_OUTPUT_WIDTH,
} from "@/lib/cover";

// Khusus browser: memakai Image dan canvas. Dipakai crop cover (CoverCropDialog)
// dan gambar di dalam konten editor (components/editor/image-upload.ts).

type Area = { x: number; y: number; width: number; height: number };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar gagal dimuat"));
    image.src = src;
  });
}

/** Menggambar `area` dari gambar ke canvas berukuran `width × height`, lalu JPEG. */
function drawToJpeg(
  image: HTMLImageElement,
  area: Area,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas tidak didukung browser ini");

  // JPEG tidak punya transparansi: tanpa latar putih, PNG transparan jadi hitam.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
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
      COVER_OUTPUT_TYPE,
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
  return drawToJpeg(image, area, width, height);
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
  return drawToJpeg(image, area, width, height);
}
