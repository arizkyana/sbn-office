"use client";

import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { Controller } from "react-hook-form";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { getDonaturUrl } from "@/lib/donatur";
import { saveCompanyProfile, saveTerms } from "../actions";
import useContentForm from "../hooks/useContentForm";
import { profileSchema, termsSchema } from "../Settings.types";

// Schema dan action tidak bisa dikirim dari Server Component, jadi dipilih di sini.
const CONTENT_FORMS = {
  terms: {
    title: "Syarat & Ketentuan",
    description:
      "Tampil di halaman Syarat & Ketentuan. Sebaiknya memuat penggunaan dana, kebijakan donasi salah nominal/campaign, dan kontak resmi.",
    path: "/syarat-ketentuan",
    schema: termsSchema,
    save: saveTerms,
  },
  profile: {
    title: "Profil Lembaga",
    description:
      "Tampil di halaman Tentang Kami. Cantumkan alamat, email, dan nomor kontak resmi lembaga.",
    path: "/tentang",
    schema: profileSchema,
    save: saveCompanyProfile,
  },
};

type ContentFormProps = {
  kind: keyof typeof CONTENT_FORMS;
  defaultValue: string;
};

/** Kartu konten HTML yang tampil sebagai halaman di website donatur. */
export default function ContentForm({ kind, defaultValue }: ContentFormProps) {
  const { title, description, path, schema, save } = CONTENT_FORMS[kind];
  const {
    control,
    handleSubmit,
    onSubmit,
    formState: { errors, isSubmitting },
  } = useContentForm({ schema, save, defaultValue });
  const websiteUrl = getDonaturUrl(path);
  const labelId = `${kind}-label`;

  return (
    <Card>
      <CardHeader>
        <CardTitle id={labelId}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {websiteUrl && (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Lihat di website
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
            name="content"
            render={({ field, fieldState: { error } }) => (
              <Field data-invalid={!!error}>
                <RichTextEditor
                  id={`${kind}-content`}
                  aria-labelledby={labelId}
                  aria-invalid={!!error}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
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
