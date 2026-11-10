import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { saveCategory } from "../actions";
import { categorySchema, type CategoryInput } from "../CategoryList.types";
import type { CategoryListItem } from "./useCategories";

type UseCategoryFormOptions = {
  /** Diisi saat mengubah; kosong saat menambah. */
  category?: CategoryListItem;
  onSaved: () => void;
};

export default function useCategoryForm({
  category,
  onSaved,
}: UseCategoryFormOptions) {
  const queryClient = useQueryClient();
  // Alias mengikuti nama sampai admin mengubahnya sendiri. Saat mengubah
  // kategori, alias tidak pernah berubah otomatis.
  const isAliasEdited = useRef(Boolean(category));

  const form = useForm<CategoryInput>({
    defaultValues: { name: category?.name ?? "", alias: category?.alias ?? "" },
    resolver: zodResolver(categorySchema),
  });

  const onNameChange = (name: string) => {
    if (isAliasEdited.current) return;
    form.setValue("alias", slugify(name));
    form.clearErrors("alias");
  };

  const onAliasChange = (alias: string) => {
    if (category) return;
    // Alias yang dikosongkan kembali mengikuti nama.
    isAliasEdited.current = alias !== "";
  };

  const onSubmit = async (values: CategoryInput) => {
    const result = await saveCategory(values, category?.uuid);
    // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
    if (!result) return;

    if (result.success) {
      toast.success(
        category ? "Kategori berhasil diubah" : "Kategori berhasil ditambahkan",
      );
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSaved();
      return;
    }

    Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
      form.setError(field as keyof CategoryInput, { message: messages[0] });
    });
    form.setError("root", { message: result.message });
  };

  return { ...form, onSubmit, onNameChange, onAliasChange };
}
