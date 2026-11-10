"use client";

import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Loader2Icon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

type CropOptions = {
  /** Rasio crop, contoh 16 / 9 untuk cover atau 1 untuk logo. */
  aspect: number;
  /** Bentuk bingkai crop; hanya tampilan, hasilnya tetap persegi panjang. */
  cropShape?: "rect" | "round";
  /** Memotong area crop (piksel gambar asli) menjadi file yang siap diunggah. */
  crop: (src: string, area: Area) => Promise<File>;
};

type ImageCropperProps = CropOptions & {
  src: string;
  onConfirm: (file: File) => void;
};

// Dipisah dari dialog agar posisi dan zoom kembali ke awal setiap gambar baru.
function ImageCropper({
  src,
  aspect,
  cropShape,
  crop: cropFile,
  onConfirm,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [area, setArea] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!area) return;
    setIsProcessing(true);
    setError(null);
    try {
      onConfirm(await cropFile(src, area));
    } catch {
      setError("Gambar gagal diproses. Coba pilih gambar lain.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="relative h-64 overflow-hidden rounded-lg bg-muted sm:h-96">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, croppedAreaPixels) => setArea(croppedAreaPixels)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Perkecil"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => setZoom((current) => clampZoom(current - ZOOM_STEP))}
        >
          <ZoomOutIcon />
        </Button>
        <Slider
          aria-label="Zoom"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          // Array: Slider shadcn merender dua thumb bila value berupa angka.
          value={[zoom]}
          onValueChange={(value) =>
            setZoom(Array.isArray(value) ? value[0] : value)
          }
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Perbesar"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => setZoom((current) => clampZoom(current + ZOOM_STEP))}
        >
          <ZoomInIcon />
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <DialogClose
          render={<Button variant="outline" disabled={isProcessing} />}
        >
          Batal
        </DialogClose>
        <Button
          type="button"
          disabled={!area || isProcessing}
          onClick={confirm}
        >
          {isProcessing && (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          )}
          Gunakan gambar
        </Button>
      </DialogFooter>
    </>
  );
}

type ImageCropDialogProps = CropOptions & {
  /** Object URL gambar yang dipilih; `null` berarti dialog tertutup. */
  src: string | null;
  /** Judul dialog, contoh "Atur cover". */
  title: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

/** Dialog crop dan zoom gambar (cover, logo) sebelum diunggah. */
export function ImageCropDialog({
  src,
  title,
  onCancel,
  onConfirm,
  ...cropOptions
}: ImageCropDialogProps) {
  return (
    <Dialog
      open={src !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Geser gambar untuk mengatur posisi. Gunakan slider, scroll, atau
            cubit untuk zoom.
          </DialogDescription>
        </DialogHeader>
        {src && (
          <ImageCropper
            key={src}
            src={src}
            onConfirm={onConfirm}
            {...cropOptions}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
