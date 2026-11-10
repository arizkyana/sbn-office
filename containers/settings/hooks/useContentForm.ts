import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types";
import type { ContentInput, termsSchema } from "../Settings.types";

type UseContentFormOptions = {
  schema: typeof termsSchema;
  save: (input: ContentInput) => Promise<ActionResult<{ value: string }>>;
  defaultValue: string;
};

/** Form konten HTML (Syarat & Ketentuan, Profil Lembaga). */
export default function useContentForm({
  schema,
  save,
  defaultValue,
}: UseContentFormOptions) {
  const form = useForm<ContentInput>({
    defaultValues: { content: defaultValue },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: ContentInput) => {
    const result = await save(values);
    // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
    if (!result) return;

    if (result.success) {
      toast.success("Pengaturan berhasil disimpan");
      // Tampilkan HTML yang tersimpan (sudah disanitasi, contoh <script> dibuang).
      if (result.data) form.reset({ content: result.data.value });
      return;
    }

    Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
      form.setError(field as keyof ContentInput, { message: messages[0] });
    });
    form.setError("root", { message: result.message });
  };

  return { ...form, onSubmit };
}
