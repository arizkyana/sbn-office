import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  COVER_EXTENSIONS,
  getCoverFileError,
  getCoverSourceError,
} from "@/lib/cover";
import type { ActionResult } from "@/lib/types";

type UseImageUploadOptions = {
  /** Server Action upload, contoh `uploadCover` (campaign) atau `uploadLogo`. */
  upload: (file: File) => Promise<ActionResult<{ url: string }>>;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  /** Agar form bisa menonaktifkan tombol Simpan selama upload. */
  onUploadingChange?: (isUploading: boolean) => void;
};

/**
 * Alur upload gambar dengan crop, dipakai `CoverUpload` dan upload logo di
 * pengaturan: file dipilih lewat `inputProps`, divalidasi, dibuka di
 * `ImageCropDialog` (`cropSrc`), lalu hasil crop langsung diunggah.
 */
export function useImageUpload({
  upload,
  onChange,
  onError,
  onUploadingChange,
}: UseImageUploadOptions) {
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
      onError("Gambar gagal diunggah. Coba lagi.");
    } finally {
      changeUploading(false);
    }
  };

  return {
    isUploading,
    openFilePicker: () => inputRef.current?.click(),
    /** Props `<input type="file">` tersembunyi; `id` dan `aria-*` diisi pemanggil. */
    inputProps: {
      ref: inputRef,
      type: "file",
      accept: Object.keys(COVER_EXTENSIONS).join(","),
      className: "sr-only",
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Reset agar file yang sama bisa dipilih lagi setelah gagal.
        event.target.value = "";
        if (file) handleSelect(file);
      },
    },
    /** Props `ImageCropDialog` selain opsi crop (rasio, judul). */
    cropDialogProps: {
      src: cropSrc,
      onCancel: () => setCropSrc(null),
      onConfirm: handleCropped,
    },
  };
}
