import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { saveLogo } from "../actions";
import { logoSchema, type LogoInput } from "../Settings.types";

export default function useLogoForm(defaultValue: string) {
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<LogoInput>({
    defaultValues: { logo_url: defaultValue },
    resolver: zodResolver(logoSchema),
  });

  const onSubmit = async (values: LogoInput) => {
    const result = await saveLogo(values);
    // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
    if (!result) return;

    if (result.success) {
      toast.success("Logo berhasil disimpan");
      if (result.data) form.reset({ logo_url: result.data.value });
      return;
    }

    Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
      form.setError(field as keyof LogoInput, { message: messages[0] });
    });
    form.setError("root", { message: result.message });
  };

  return {
    ...form,
    onSubmit,
    // Diisi LogoUpload agar tombol Simpan nonaktif selama logo diunggah.
    onUploadingChange: setIsUploading,
    isBusy: form.formState.isSubmitting || isUploading,
  };
}
