"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COVER_EXTENSIONS, getCoverFileError } from "@/lib/cover";
import type { ActionResult } from "@/lib/types";

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

// Cover langsung diunggah saat file dipilih; form hanya menyimpan URL-nya.
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

  const changeUploading = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  };

  const handleSelect = async (file: File) => {
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
          <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
            <ImageIcon className="size-6" />
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
    </div>
  );
}
