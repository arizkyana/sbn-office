"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { uploadEditorImage } from "@/components/editor/actions";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { CoverUpload } from "@/components/upload/CoverUpload";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { postStatusOptions, postTypeOptions } from "@/lib/post";
import { getYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
import useCategoryOptions from "@/containers/blog/categories/hooks/useCategoryOptions";
import { uploadPostCover } from "./actions";
import DeletePostButton from "./components/DeletePostButton";
import usePostForm from "./hooks/usePostForm";
import type { PostInput } from "./PostForm.types";

const DESCRIPTION_MAX = 160;

type PostFormProps = {
  /** Diisi di halaman ubah; kosong di halaman tambah. */
  uuid?: string;
  defaultValues?: PostInput;
};

export function PostForm({ uuid, defaultValues }: PostFormProps) {
  const {
    control,
    handleSubmit,
    onSubmit,
    onCancel,
    onTitleChange,
    onSlugChange,
    setError,
    clearErrors,
    onUploadingChange,
    isBusy,
    formState: { errors, isSubmitting },
  } = usePostForm({ uuid, defaultValues });
  const { data: categoryOptions, isPending: isCategoriesPending } =
    useCategoryOptions();
  const type = useWatch({ control, name: "type" });
  const videoUrl = useWatch({ control, name: "video_url" });
  const isVideo = type === "VIDEO";
  const videoId = isVideo ? getYouTubeId(videoUrl) : null;
  const isEdit = Boolean(uuid);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Di luar <form> agar tombol Hapus tidak ikut men-submit form. */}
      <PageHeader
        title={isEdit ? "Ubah Post" : "Tambah Post"}
        actions={uuid && <DeletePostButton uuid={uuid} />}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        {errors.root && (
          <p role="alert" className="text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <Card>
            <CardHeader>
              <CardTitle>Konten</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={control}
                  name="type"
                  render={({ field, fieldState: { error } }) => (
                    <Field data-invalid={!!error}>
                      <FieldLabel htmlFor="type">Tipe</FieldLabel>
                      <Select
                        items={postTypeOptions}
                        value={field.value}
                        onValueChange={(value) =>
                          value && field.onChange(value)
                        }
                      >
                        <SelectTrigger
                          id="type"
                          className="w-full sm:w-48"
                          aria-invalid={!!error}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {postTypeOptions.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[error]} />
                    </Field>
                  )}
                />
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
                          ? "Mengubah slug post yang sudah dibagikan membuat link lama tidak berlaku"
                          : "Terisi otomatis dari judul dan menjadi alamat halaman post"}
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
                          Ringkasan singkat untuk mesin pencari dan pratinjau
                          link
                        </FieldDescription>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {field.value.length}/{DESCRIPTION_MAX}
                        </span>
                      </div>
                      <FieldError errors={[error]} />
                    </Field>
                  )}
                />
                {isVideo && (
                  <Controller
                    control={control}
                    name="video_url"
                    render={({ field, fieldState: { error } }) => (
                      <Field data-invalid={!!error}>
                        <FieldLabel htmlFor="video_url">URL video</FieldLabel>
                        <Input
                          {...field}
                          id="video_url"
                          type="url"
                          inputMode="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          aria-invalid={!!error}
                        />
                        <FieldDescription>
                          Link YouTube berstatus Public atau Unlisted
                        </FieldDescription>
                        <FieldError errors={[error]} />
                        {videoId && (
                          <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
                            <Image
                              src={getYouTubeThumbnail(videoId)}
                              alt="Thumbnail video YouTube"
                              fill
                              sizes="320px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </Field>
                    )}
                  />
                )}
                <Controller
                  control={control}
                  name="content"
                  render={({ field, fieldState: { error } }) => (
                    <Field data-invalid={!!error}>
                      <FieldTitle id="content-label">
                        {isVideo ? "Keterangan video (opsional)" : "Konten"}
                      </FieldTitle>
                      <RichTextEditor
                        id="content"
                        aria-labelledby="content-label"
                        aria-invalid={!!error}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        imageUpload={uploadEditorImage}
                      />
                      <FieldError errors={[error]} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={control}
                  name="status"
                  render={({ field, fieldState: { error } }) => (
                    <Field data-invalid={!!error}>
                      <FieldLabel htmlFor="status">Status</FieldLabel>
                      <Select
                        items={postStatusOptions}
                        value={field.value}
                        onValueChange={(value) =>
                          value && field.onChange(value)
                        }
                      >
                        <SelectTrigger
                          id="status"
                          className="w-full"
                          aria-invalid={!!error}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {postStatusOptions.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Hanya post Publish yang tampil di blog donatur
                      </FieldDescription>
                      <FieldError errors={[error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="categories_id"
                  render={({ field, fieldState: { error } }) => (
                    <Field data-invalid={!!error}>
                      <FieldLabel htmlFor="categories_id">Kategori</FieldLabel>
                      {!isCategoriesPending && categoryOptions?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Belum ada kategori.{" "}
                          <Link
                            href="/blog/categories"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            Buat kategori terlebih dahulu
                          </Link>
                        </p>
                      ) : (
                        <Select
                          items={categoryOptions ?? []}
                          // null menampilkan placeholder saat belum dipilih.
                          value={field.value || null}
                          onValueChange={(value) =>
                            value && field.onChange(value)
                          }
                        >
                          <SelectTrigger
                            id="categories_id"
                            className="w-full"
                            aria-invalid={!!error}
                          >
                            <SelectValue
                              placeholder={
                                isCategoriesPending
                                  ? "Memuat kategori…"
                                  : "Pilih kategori"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions?.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
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
                        alt="Pratinjau cover post"
                        invalid={!!error}
                        upload={uploadPostCover}
                        onChange={(url) => {
                          field.onChange(url);
                          clearErrors("cover");
                        }}
                        onError={(message) => setError("cover", { message })}
                        onUploadingChange={onUploadingChange}
                      />
                      <FieldDescription>
                        {isVideo
                          ? "Kosongkan untuk memakai thumbnail YouTube. JPG, PNG, atau WEBP, maksimal 10 MB, dipotong ke rasio 16:9."
                          : "JPG, PNG, atau WEBP, maksimal 10 MB. Gambar dipotong ke rasio 16:9."}
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
            render={<Link href="/blog/posts" onClick={onCancel} />}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
