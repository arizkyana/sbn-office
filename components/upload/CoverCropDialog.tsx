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
import { COVER_ASPECT, COVER_OUTPUT_TYPE } from "@/lib/cover";
import { cropImage } from "@/lib/crop-image";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

type CoverCropperProps = {
  src: string;
  onConfirm: (file: File) => void;
};

// Dipisah dari dialog agar posisi dan zoom kembali ke awal setiap gambar baru.
function CoverCropper({ src, onConfirm }: CoverCropperProps) {
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
      const blob = await cropImage(src, area);
      onConfirm(new File([blob], "cover.jpg", { type: COVER_OUTPUT_TYPE }));
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
          aspect={COVER_ASPECT}
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

type CoverCropDialogProps = {
  /** Object URL gambar yang dipilih; `null` berarti dialog tertutup. */
  src: string | null;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

/** Dialog crop dan zoom cover ke rasio 16:9 sebelum diunggah. */
export function CoverCropDialog({
  src,
  onCancel,
  onConfirm,
}: CoverCropDialogProps) {
  return (
    <Dialog
      open={src !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atur cover</DialogTitle>
          <DialogDescription>
            Geser gambar untuk mengatur posisi. Gunakan slider, scroll, atau
            cubit untuk zoom.
          </DialogDescription>
        </DialogHeader>
        {src && <CoverCropper key={src} src={src} onConfirm={onConfirm} />}
      </DialogContent>
    </Dialog>
  );
}
