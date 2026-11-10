"use client";

import { Loader2Icon } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import useLogoForm from "../hooks/useLogoForm";
import LogoUpload from "./LogoUpload";

/** Kartu logo utama: header dan favicon website donatur serta panel admin. */
export default function LogoForm({ defaultValue }: { defaultValue: string }) {
  const {
    control,
    handleSubmit,
    onSubmit,
    setError,
    clearErrors,
    onUploadingChange,
    isBusy,
    formState: { errors, isDirty, isSubmitting },
  } = useLogoForm(defaultValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo</CardTitle>
        <CardDescription>
          Tampil di website donatur dan panel admin, juga sebagai ikon tab
          browser (favicon).
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          <Controller
            control={control}
            name="logo_url"
            render={({ field, fieldState: { error } }) => (
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="logo_url" className="sr-only">
                  File logo
                </FieldLabel>
                <LogoUpload
                  id="logo_url"
                  value={field.value}
                  invalid={!!error}
                  onChange={(url) => {
                    field.onChange(url);
                    clearErrors("logo_url");
                  }}
                  onError={(message) => setError("logo_url", { message })}
                  onUploadingChange={onUploadingChange}
                />
                <FieldDescription>
                  JPG, PNG, atau WEBP, maksimal 10 MB. Gambar dipotong persegi;
                  PNG berlatar transparan membuat favicon lebih rapi. Website
                  donatur memperbarui logo dalam beberapa menit setelah
                  disimpan.
                </FieldDescription>
                <FieldError errors={[error]} />
              </Field>
            )}
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            {isDirty && (
              <p className="text-sm text-muted-foreground">
                Logo belum disimpan.
              </p>
            )}
            <Button type="submit" disabled={isBusy}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
