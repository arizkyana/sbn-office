import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { savePost } from "../actions";
import { postSchema, type PostInput } from "../PostForm.types";

type UsePostFormOptions = {
  /** Diisi di halaman ubah; kosong di halaman tambah. */
  uuid?: string;
  defaultValues?: PostInput;
};

export default function usePostForm({
  uuid,
  defaultValues,
}: UsePostFormOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isNavigating, startTransition] = useTransition();
  // Slug mengikuti judul sampai admin mengubahnya sendiri. Di halaman ubah,
  // slug tidak pernah berubah otomatis karena link lama bisa sudah dibagikan.
  const isSlugEdited = useRef(Boolean(uuid));

  const form = useForm<PostInput>({
    defaultValues: defaultValues ?? {
      type: "ARTICLE",
      title: "",
      slug: "",
      categories_id: "",
      description: "",
      content: "",
      cover: "",
      video_url: "",
      status: "DRAFT",
    },
    resolver: zodResolver(postSchema),
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

  const onSubmit = async (values: PostInput) => {
    const result = await savePost(values, uuid);
    // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
    if (!result) return;

    if (result.success) {
      toast.success("Post berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      startTransition(() => router.push("/blog/posts"));
      return;
    }

    Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
      form.setError(field as keyof PostInput, { message: messages[0] });
    });
    form.setError("root", { message: result.message });
  };

  return {
    ...form,
    onSubmit,
    onTitleChange,
    onSlugChange,
    // Diisi CoverUpload agar tombol Simpan nonaktif selama cover diunggah.
    onUploadingChange: setIsUploading,
    isBusy: form.formState.isSubmitting || isUploading || isNavigating,
  };
}
