"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  NewspaperIcon,
  PlusIcon,
  SearchXIcon,
} from "lucide-react";
import { TableCard } from "@/components/data/TableCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useCategoryOptions from "@/containers/blog/categories/hooks/useCategoryOptions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import PostFilters from "./components/PostFilters";
import PostTable from "./components/PostTable";
import usePosts from "./hooks/usePosts";
import { emptyPostFilterValues, type PostFilterValues } from "./PostList.types";

function AddPostButton() {
  return (
    <Button nativeButton={false} render={<Link href="/blog/posts/new" />}>
      <PlusIcon data-icon="inline-start" />
      Tambah Post
    </Button>
  );
}

export function PostList() {
  const [values, setValues] = useState<PostFilterValues>(emptyPostFilterValues);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(values.search.trim());

  const { data, isPending, isError, isPlaceholderData, refetch, isRefetching } =
    usePosts({ ...values, search: debouncedSearch, page });
  const { data: categoryOptions = [] } = useCategoryOptions();
  const isFiltered =
    debouncedSearch !== "" ||
    values.type !== "ALL" ||
    values.status !== "ALL" ||
    values.categoriesId !== "ALL";

  const changeFilters = (changed: Partial<PostFilterValues>) => {
    setValues((current) => ({ ...current, ...changed }));
    setPage(1);
  };

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <TableCard>
          <EmptyState
            icon={CircleAlertIcon}
            title="Daftar post gagal dimuat"
            description="Periksa koneksi internet, lalu coba lagi."
            action={
              <Button
                variant="outline"
                disabled={isRefetching}
                onClick={() => refetch()}
              >
                Coba lagi
              </Button>
            }
          />
        </TableCard>
      );
    }

    if (data.rows.length === 0) {
      return (
        <TableCard>
          {isFiltered ? (
            <EmptyState
              icon={SearchXIcon}
              title="Post tidak ditemukan"
              description="Coba ubah kata kunci, tipe, status, atau kategori."
              action={
                <Button
                  variant="outline"
                  onClick={() => changeFilters(emptyPostFilterValues)}
                >
                  Reset filter
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={NewspaperIcon}
              title="Belum ada post"
              description="Artikel dan video yang dibuat akan tampil di sini."
              action={<AddPostButton />}
            />
          )}
        </TableCard>
      );
    }

    return (
      <>
        <PostTable rows={data.rows} isStale={isPlaceholderData} />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPlaceholderData}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages || isPlaceholderData}
              onClick={() => setPage((current) => current + 1)}
            >
              Berikutnya
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Artikel & Video"
        description="Kelola kabar program, laporan penyaluran, dan video kegiatan."
        actions={<AddPostButton />}
      />
      <PostFilters
        values={values}
        categoryOptions={categoryOptions}
        onChange={changeFilters}
        onReset={() => changeFilters(emptyPostFilterValues)}
      />
      {renderContent()}
    </div>
  );
}
