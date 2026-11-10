"use client";

import Image from "next/image";
import { Loader2Icon, RotateCcwIcon, UploadIcon, XIcon } from "lucide-react";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { ImageCropDialog } from "@/components/upload/ImageCropDialog";
import { useImageUpload } from "@/components/upload/use-image-upload";
import { cropLogo } from "@/lib/image-processing";
import { DEFAULT_LOGO_SRC, LOGO_OUTPUT_TYPE } from "@/lib/logo";
import { uploadLogo } from "../actions";

async function cropLogoFile(src: string, area: Area) {
  const blob = await cropLogo(src, area);
  return new File([blob], "logo.png", { type: LOGO_OUTPUT_TYPE });
}

type LogoUploadProps = {
  id: string;
  /** URL publik logo yang sudah diunggah; kosong berarti logo bawaan. */
  value: string;
  invalid?: boolean;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
};

/**
 * Pratinjau logo (lingkaran seperti di header) dan favicon di tab browser.
 * File yang dipilih dipotong persegi, lalu langsung diunggah; form hanya
 * menyimpan URL-nya.
 */
export default function LogoUpload({
  id,
  value,
  invalid,
  onChange,
  onError,
  onUploadingChange,
}: LogoUploadProps) {
  const { isUploading, openFilePicker, inputProps, cropDialogProps } =
    useImageUpload({
      upload: uploadLogo,
      onChange,
      onError,
      onUploadingChange,
    });
  const src = value || DEFAULT_LOGO_SRC;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div
        data-invalid={invalid}
        className="relative size-24 shrink-0 overflow-hidden rounded-full border bg-muted data-[invalid=true]:border-destructive"
      >
        <Image
          src={src}
          alt={value ? "Pratinjau logo" : "Logo bawaan"}
          fill
          sizes="96px"
          className="object-cover"
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2Icon className="size-5 animate-spin" />
            <span className="sr-only">Mengunggah…</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            {value ? "Logo baru" : "Logo bawaan"} · tampilan di tab browser
          </span>
          {/* Tiruan tab browser untuk pratinjau favicon (persegi, tanpa dipotong lingkaran). */}
          <div
            aria-hidden
            className="flex w-56 max-w-full items-center gap-2 rounded-t-lg border border-b-0 bg-muted/60 px-3 py-2 text-xs"
          >
            <Image
              src={src}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0"
            />
            <span className="truncate">Sobat Baik Nusantara</span>
            <XIcon className="ml-auto size-3 shrink-0 text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={openFilePicker}
          >
            <UploadIcon />
            Ganti logo
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              disabled={isUploading}
              onClick={() => onChange("")}
            >
              <RotateCcwIcon />
              Pakai logo bawaan
            </Button>
          )}
        </div>
      </div>
      <input {...inputProps} id={id} aria-invalid={invalid} />
      <ImageCropDialog
        {...cropDialogProps}
        title="Atur logo"
        aspect={1}
        // Logo tampil berbentuk lingkaran di header; favicon memakai persegi utuh.
        cropShape="round"
        crop={cropLogoFile}
      />
    </div>
  );
}
