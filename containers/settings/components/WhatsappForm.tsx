"use client";

import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { Input } from "@/components/ui/input";
import useWhatsappForm from "../hooks/useWhatsappForm";

/** Kartu nomor WhatsApp admin untuk tombol "Chat Admin" di website donatur. */
export default function WhatsappForm({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const {
    control,
    handleSubmit,
    onSubmit,
    savedNumber,
    formState: { errors, isSubmitting },
  } = useWhatsappForm(defaultValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Admin</CardTitle>
        <CardDescription>
          Nomor tujuan tombol &quot;Chat Admin&quot; di website donatur.
        </CardDescription>
        {savedNumber && (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/${savedNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Coba buka WhatsApp
              <ExternalLinkIcon data-icon="inline-end" />
            </Button>
          </CardAction>
        )}
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
            name="whatsapp_number"
            render={({ field, fieldState: { error } }) => (
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="whatsapp_number">
                  Nomor WhatsApp
                </FieldLabel>
                <Input
                  {...field}
                  id="whatsapp_number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  className="sm:max-w-xs"
                  aria-invalid={!!error}
                />
                <FieldDescription>
                  Contoh: 081234567890. Disimpan dalam format 6281234567890.
                </FieldDescription>
                <FieldError errors={[error]} />
              </Field>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
