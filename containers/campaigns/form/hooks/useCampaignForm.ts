import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { todayInJakarta } from "@/lib/date";
import { slugify } from "@/lib/slug";
import { saveCampaign, uploadCover } from "../actions";
import {
  campaignSchema,
  getCoverFileError,
  type CampaignInput,
} from "../CampaignForm.types";

type UseCampaignFormOptions = {
  /** Diisi di halaman ubah; kosong di halaman tambah. */
  uuid?: string;
  defaultValues?: CampaignInput;
};

export default function useCampaignForm({
  uuid,
  defaultValues,
}: UseCampaignFormOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isNavigating, startTransition] = useTransition();
  // Slug mengikuti judul sampai admin mengubahnya sendiri. Di halaman ubah,
  // slug tidak pernah berubah otomatis karena link lama bisa sudah dibagikan.
  const isSlugEdited = useRef(Boolean(uuid));

  const form = useForm<CampaignInput>({
    defaultValues: defaultValues ?? {
      title: "",
      slug: "",
      description: "",
      content: "",
      cover: "",
      start_date: todayInJakarta(),
      end_date: "",
      target_budget: null,
      status: "DRAFT",
    },
    resolver: zodResolver(campaignSchema),
  });

  const onTitleChange = (title: string) => {
    if (isSlugEdited.current) return;
    form.setValue("slug", slugify(title));
    form.clearErrors("slug");
  };

  const onSlugChange = (slug: string) => {
    if (uuid) return;
    // Slug yang dikosongkan kembali mengikuti judul.
    isSlugEdited.current = slug !== "";
  };

  const onCoverSelect = async (file: File) => {
    const fileError = getCoverFileError(file);
    if (fileError) {
      form.setError("cover", { message: fileError });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadCover(file);
      if (!result) return;
      if (!result.success) {
        form.setError("cover", { message: result.message });
        return;
      }
      if (result.data) {
        form.setValue("cover", result.data.url, { shouldDirty: true });
        form.clearErrors("cover");
      }
    } catch {
      form.setError("cover", { message: "Cover gagal diunggah. Coba lagi." });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: CampaignInput) => {
    const result = await saveCampaign(values, uuid);
    // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
    if (!result) return;

    if (result.success) {
      toast.success("Campaign berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      startTransition(() => router.push("/campaigns"));
      return;
    }

    Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
      form.setError(field as keyof CampaignInput, { message: messages[0] });
    });
    form.setError("root", { message: result.message });
  };

  return {
    ...form,
    onSubmit,
    onTitleChange,
    onSlugChange,
    onCoverSelect,
    isUploading,
    isBusy: form.formState.isSubmitting || isUploading || isNavigating,
  };
}
