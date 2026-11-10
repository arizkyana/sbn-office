"use client";

import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { Controller } from "react-hook-form";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { CoverUpload } from "@/components/upload/CoverUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { campaignStatusOptions } from "@/lib/campaign";
import { formatRupiah } from "@/lib/utils";
import { uploadCover } from "./actions";
import type { CampaignInput } from "./CampaignForm.types";
import useCampaignForm from "./hooks/useCampaignForm";

const DESCRIPTION_MAX = 160;

type CampaignFormProps = {
  /** Diisi di halaman ubah; kosong di halaman tambah. */
  uuid?: string;
  defaultValues?: CampaignInput;
};

export function CampaignForm({ uuid, defaultValues }: CampaignFormProps) {
  const {
    control,
    handleSubmit,
    onSubmit,
    onTitleChange,
    onSlugChange,
    setError,
    clearErrors,
    onUploadingChange,
    isBusy,
    formState: { errors, isSubmitting },
  } = useCampaignForm({ uuid, defaultValues });
  const isEdit = Boolean(uuid);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 p-6"
      noValidate
    >
      <h1 className="text-2xl font-semibold">
        {isEdit ? "Ubah Campaign" : "Tambah Campaign"}
      </h1>

      {errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card>
          <CardContent>
            <FieldGroup>
              <Controller
                control={control}
                name="title"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="title">Judul</FieldLabel>
                    <Input
                      {...field}
                      id="title"
                      aria-invalid={!!error}
                      onChange={(event) => {
                        field.onChange(event);
                        onTitleChange(event.target.value);
                      }}
                    />
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="slug"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                    <Input
                      {...field}
                      id="slug"
                      aria-invalid={!!error}
                      onChange={(event) => {
                        field.onChange(event);
                        onSlugChange(event.target.value);
                      }}
                    />
                    <FieldDescription>
                      {isEdit
                        ? "Mengubah slug campaign yang sudah dibagikan membuat link lama tidak berlaku"
                        : "Terisi otomatis dari judul dan menjadi alamat halaman campaign"}
                    </FieldDescription>
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
                      rows={3}
                      aria-invalid={!!error}
                    />
                    <div className="flex justify-between gap-4">
                      <FieldDescription>
                        Ringkasan singkat untuk mesin pencari dan pratinjau link
                      </FieldDescription>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {field.value.length}/{DESCRIPTION_MAX}
                      </span>
                    </div>
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="content"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldTitle id="content-label">Konten</FieldTitle>
                    <RichTextEditor
                      id="content"
                      aria-labelledby="content-label"
                      aria-invalid={!!error}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <FieldGroup>
              <Controller
                control={control}
                name="status"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      items={campaignStatusOptions}
                      value={field.value}
                      onValueChange={(value) => value && field.onChange(value)}
                    >
                      <SelectTrigger
                        id="status"
                        className="w-full"
                        aria-invalid={!!error}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignStatusOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Hanya campaign Publish yang tampil di halaman donatur
                    </FieldDescription>
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="cover"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="cover">Cover</FieldLabel>
                    <CoverUpload
                      id="cover"
                      value={field.value}
                      alt="Pratinjau cover campaign"
                      invalid={!!error}
                      upload={uploadCover}
                      onChange={(url) => {
                        field.onChange(url);
                        clearErrors("cover");
                      }}
                      onError={(message) => setError("cover", { message })}
                      onUploadingChange={onUploadingChange}
                    />
                    <FieldDescription>
                      JPG, PNG, atau WEBP, maksimal 10 MB. Gambar dipotong ke
                      rasio 16:9.
                    </FieldDescription>
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="start_date"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="start_date">Tanggal mulai</FieldLabel>
                    <Input
                      {...field}
                      id="start_date"
                      type="date"
                      aria-invalid={!!error}
                    />
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="end_date"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="end_date">Tanggal berakhir</FieldLabel>
                    <Input
                      {...field}
                      id="end_date"
                      type="date"
                      aria-invalid={!!error}
                    />
                    <FieldDescription>
                      Kosongkan bila tanpa batas waktu
                    </FieldDescription>
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="target_budget"
                render={({ field, fieldState: { error } }) => (
                  <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="target_budget">
                      Target donasi
                    </FieldLabel>
                    <Input
                      ref={field.ref}
                      name={field.name}
                      id="target_budget"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      aria-invalid={!!error}
                      value={field.value ?? ""}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? null
                            : event.target.valueAsNumber,
                        )
                      }
                    />
                    <FieldDescription>
                      {field.value
                        ? formatRupiah(field.value)
                        : "Kosongkan bila tanpa target nominal"}
                    </FieldDescription>
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/campaigns" />}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isBusy}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Simpan
        </Button>
      </div>
    </form>
  );
}
