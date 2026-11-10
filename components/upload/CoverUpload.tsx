"use client";

import Image from "next/image";
import { ImageIcon, Loader2Icon, UploadIcon } from "lucide-react";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { COVER_ASPECT, COVER_OUTPUT_TYPE } from "@/lib/cover";
import { cropImage } from "@/lib/image-processing";
import type { ActionResult } from "@/lib/types";
import { ImageCropDialog } from "./ImageCropDialog";
import { useImageUpload } from "./use-image-upload";

async function cropCover(src: string, area: Area) {
  const blob = await cropImage(src, area);
  return new File([blob], "cover.jpg", { type: COVER_OUTPUT_TYPE });
}

type CoverUploadProps = {
  id: string;
  /** URL publik cover yang sudah diunggah. */
  value: string;
  /** Teks alternatif pratinjau, contoh "Pratinjau cover campaign". */
  alt: string;
  invalid?: boolean;
  /** Server Action upload, contoh `uploadCover` (campaign) atau `uploadPostCover`. */
  upload: (file: File) => Promise<ActionResult<{ url: string }>>;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  /** Agar form bisa menonaktifkan tombol Simpan selama upload. */
  onUploadingChange?: (isUploading: boolean) => void;
};

// File yang dipilih dipotong ke 16:9 di dialog, lalu langsung diunggah;
// form hanya menyimpan URL-nya.
export function CoverUpload({
  id,
  value,
  alt,
  invalid,
  upload,
  onChange,
  onError,
  onUploadingChange,
}: CoverUploadProps) {
  const { isUploading, openFilePicker, inputProps, cropDialogProps } =
    useImageUpload({ upload, onChange, onError, onUploadingChange });

  return (
    <div className="flex flex-col gap-2">
      <div
        data-invalid={invalid}
        className="relative aspect-video overflow-hidden rounded-lg border bg-muted data-[invalid=true]:border-destructive"
      >
        {value ? (
          <Image
            src={value}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageIcon className="size-6" />
            </span>
            Belum ada cover
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-sm">
            <Loader2Icon className="size-4 animate-spin" />
            Mengunggah…
          </div>
        )}
      </div>
      <input {...inputProps} id={id} aria-invalid={invalid} />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={openFilePicker}
      >
        <UploadIcon />
        {value ? "Ganti cover" : "Pilih gambar"}
      </Button>
      <ImageCropDialog
        {...cropDialogProps}
        title="Atur cover"
        aspect={COVER_ASPECT}
        crop={cropCover}
      />
    </div>
  );
}
