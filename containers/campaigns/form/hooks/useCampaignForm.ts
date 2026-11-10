import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { todayInJakarta } from "@/lib/date";
import { useResetOnHide } from "@/hooks/use-reset-on-hide";
import { slugify } from "@/lib/slug";
import { saveCampaign } from "../actions";
import { campaignSchema, type CampaignInput } from "../CampaignForm.types";

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
  const resetOnHide = useResetOnHide();

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

  const resetForm = (values?: CampaignInput) => {
    form.reset(values);
    isSlugEdited.current = Boolean(uuid);
  };

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

  const onSubmit = async (values: CampaignInput) => {
    const result = await saveCampaign(values, uuid);
    // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
    if (!result) return;

    if (result.success) {
      toast.success("Campaign berhasil disimpan");
      // Halaman ubah menyimpan nilai terbaru; halaman tambah kembali kosong.
      resetOnHide.schedule(() => resetForm(uuid ? values : undefined));
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      startTransition(() => router.push("/campaigns"));
      return;
    }

    Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
      form.setError(field as keyof CampaignInput, { message: messages[0] });
    });
    form.setError("root", { message: result.message });
  };

  // Batal: perubahan yang belum disimpan dibuang saat halaman ditinggalkan.
  const onCancel = () => resetOnHide.schedule(() => resetForm());

  return {
    ...form,
    onSubmit,
    onCancel,
    onTitleChange,
    onSlugChange,
    // Diisi CoverUpload agar tombol Simpan nonaktif selama cover diunggah.
    onUploadingChange: setIsUploading,
    isBusy: form.formState.isSubmitting || isUploading || isNavigating,
  };
}
