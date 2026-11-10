"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COVER_EXTENSIONS,
  getCoverFileError,
  getCoverSourceError,
} from "@/lib/cover";
import type { ActionResult } from "@/lib/types";
import { CoverCropDialog } from "./CoverCropDialog";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Object URL file asli yang sedang dibuka di dialog crop.
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Object URL dicabut saat dialog ditutup atau komponen dilepas.
  useEffect(() => {
    if (!cropSrc) return;
    return () => URL.revokeObjectURL(cropSrc);
  }, [cropSrc]);

  const changeUploading = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  };

  const handleSelect = (file: File) => {
    const sourceError = getCoverSourceError(file);
    if (sourceError) {
      onError(sourceError);
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropped = async (file: File) => {
    setCropSrc(null);

    const fileError = getCoverFileError(file);
    if (fileError) {
      onError(fileError);
      return;
    }

    changeUploading(true);
    try {
      const result = await upload(file);
      // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
      if (!result) return;
      if (!result.success) {
        onError(result.message);
        return;
      }
      if (result.data) onChange(result.data.url);
    } catch {
      onError("Cover gagal diunggah. Coba lagi.");
    } finally {
      changeUploading(false);
    }
  };

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
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={Object.keys(COVER_EXTENSIONS).join(",")}
        className="sr-only"
        aria-invalid={invalid}
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset agar file yang sama bisa dipilih lagi setelah gagal.
          event.target.value = "";
          if (file) handleSelect(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon />
        {value ? "Ganti cover" : "Pilih gambar"}
      </Button>
      <CoverCropDialog
        src={cropSrc}
        onCancel={() => setCropSrc(null)}
        onConfirm={handleCropped}
      />
    </div>
  );
}
