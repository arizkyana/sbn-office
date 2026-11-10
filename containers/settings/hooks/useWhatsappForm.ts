import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { saveWhatsapp } from "../actions";
import { whatsappSchema, type WhatsappInput } from "../Settings.types";

export default function useWhatsappForm(defaultValue: string) {
  // Nomor yang tersimpan di database, untuk link "Coba buka WhatsApp".
  const [savedNumber, setSavedNumber] = useState(defaultValue);
  const form = useForm<WhatsappInput>({
    defaultValues: { whatsapp_number: defaultValue },
    resolver: zodResolver(whatsappSchema),
  });

  const onSubmit = async (values: WhatsappInput) => {
    const result = await saveWhatsapp(values);
    // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
    if (!result) return;

    if (result.success) {
      toast.success("Pengaturan berhasil disimpan");
      if (result.data) {
        // Tampilkan nomor yang sudah dinormalisasi (contoh 0812… → 62812…).
        form.reset({ whatsapp_number: result.data.value });
        setSavedNumber(result.data.value);
      }
      return;
    }

    Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
      form.setError(field as keyof WhatsappInput, { message: messages[0] });
    });
    form.setError("root", { message: result.message });
  };

  return { ...form, onSubmit, savedNumber };
}
