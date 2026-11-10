"use client";

import { useState } from "react";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { CategoryListItem } from "../hooks/useCategories";
import useDeleteCategory from "../hooks/useDeleteCategory";

/** Tombol Hapus dengan dialog konfirmasi. Ditolak bila kategori masih dipakai post. */
export default function DeleteCategoryDialog({
  category,
}: {
  category: CategoryListItem;
}) {
  const [open, setOpen] = useState(false);
  const { remove, isPending } = useDeleteCategory(category.uuid);

  const confirm = async () => {
    const deleted = await remove();
    if (deleted) setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="outline" size="sm" />}
        aria-label={`Hapus kategori ${category.name}`}
      >
        <Trash2Icon data-icon="inline-start" />
        Hapus
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
          <AlertDialogDescription>
            Kategori &quot;{category.name}&quot; akan dihapus permanen. Kategori
            yang masih dipakai post tidak bisa dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={confirm}
          >
            {isPending && (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            )}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
