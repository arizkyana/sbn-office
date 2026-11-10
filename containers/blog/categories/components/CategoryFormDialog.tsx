"use client";

import { Loader2Icon } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CategoryListItem } from "../hooks/useCategories";
import useCategoryForm from "../hooks/useCategoryForm";

type CategoryFormProps = {
  category?: CategoryListItem;
  onSaved: () => void;
};

// Dipisah dari dialog agar form dibuat ulang setiap dialog dibuka.
function CategoryForm({ category, onSaved }: CategoryFormProps) {
  const {
    control,
    handleSubmit,
    onSubmit,
    onNameChange,
    onAliasChange,
    formState: { errors, isSubmitting },
  } = useCategoryForm({ category, onSaved });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      {errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}
      <FieldGroup>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState: { error } }) => (
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="category-name">Nama</FieldLabel>
              <Input
                {...field}
                id="category-name"
                autoComplete="off"
                aria-invalid={!!error}
                onChange={(event) => {
                  field.onChange(event);
                  onNameChange(event.target.value);
                }}
              />
              <FieldError errors={[error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="alias"
          render={({ field, fieldState: { error } }) => (
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="category-alias">Alias</FieldLabel>
              <Input
                {...field}
                id="category-alias"
                autoComplete="off"
                aria-invalid={!!error}
                onChange={(event) => {
                  field.onChange(event);
                  onAliasChange(event.target.value);
                }}
              />
              <FieldDescription>
                Terisi otomatis dari nama. Huruf kecil, angka, dan tanda -
              </FieldDescription>
              <FieldError errors={[error]} />
            </Field>
          )}
        />
      </FieldGroup>
      <DialogFooter>
        <DialogClose
          render={<Button variant="outline" disabled={isSubmitting} />}
        >
          Batal
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          )}
          Simpan
        </Button>
      </DialogFooter>
    </form>
  );
}

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Diisi saat mengubah; kosong saat menambah. */
  category?: CategoryListItem;
};

/** Dialog tambah/ubah kategori (BLG002). */
export default function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Ubah Kategori" : "Tambah Kategori"}
          </DialogTitle>
        </DialogHeader>
        <CategoryForm
          key={category?.uuid ?? "new"}
          category={category}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
