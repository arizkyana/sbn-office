"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImageIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COVER_EXTENSIONS } from "../CampaignForm.types";

type CoverUploadProps = {
  id: string;
  /** URL publik cover yang sudah diunggah. */
  value: string;
  isUploading: boolean;
  invalid?: boolean;
  onSelect: (file: File) => void;
};

export default function CoverUpload({
  id,
  value,
  isUploading,
  invalid,
  onSelect,
}: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div
        data-invalid={invalid}
        className="relative aspect-video overflow-hidden rounded-lg border bg-muted data-[invalid=true]:border-destructive"
      >
        {value ? (
          <Image
            src={value}
            alt="Pratinjau cover campaign"
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
          if (file) onSelect(file);
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
