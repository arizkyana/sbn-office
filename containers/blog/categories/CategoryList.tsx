"use client";

import { useState } from "react";
import { CircleAlertIcon, PencilIcon, PlusIcon, TagsIcon } from "lucide-react";
import { TableCard } from "@/components/data/TableCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryFormDialog from "./components/CategoryFormDialog";
import DeleteCategoryDialog from "./components/DeleteCategoryDialog";
import useCategories, { type CategoryListItem } from "./hooks/useCategories";

type DialogState = { open: boolean; category?: CategoryListItem };

/** Daftar kategori blog tanpa pagination, karena jumlahnya sedikit (BLG002). */
export function CategoryList() {
  const { data, isPending, isError, refetch, isRefetching } = useCategories();
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const openDialog = (category?: CategoryListItem) =>
    setDialog({ open: true, category });

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <TableCard>
          <EmptyState
            icon={CircleAlertIcon}
            title="Daftar kategori gagal dimuat"
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

    if (data.length === 0) {
      return (
        <TableCard>
          <EmptyState
            icon={TagsIcon}
            title="Belum ada kategori"
            description="Buat kategori sebelum menulis artikel atau video."
            action={
              <Button onClick={() => openDialog()}>
                <PlusIcon data-icon="inline-start" />
                Tambah Kategori
              </Button>
            }
          />
        </TableCard>
      );
    }

    return (
      <TableCard>
        <Table className="min-w-140">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Nama</TableHead>
              <TableHead>Alias</TableHead>
              <TableHead className="text-right">Jumlah post</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((category) => (
              <TableRow key={category.uuid}>
                <TableCell className="pl-4 font-medium">
                  {category.name}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {category.alias}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {category.postCount}
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Ubah kategori ${category.name}`}
                      onClick={() => openDialog(category)}
                    >
                      <PencilIcon data-icon="inline-start" />
                      Ubah
                    </Button>
                    <DeleteCategoryDialog category={category} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableCard>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Kategori Blog"
        description="Kelompokkan artikel dan video, contoh News atau CSR."
        actions={
          <Button onClick={() => openDialog()}>
            <PlusIcon data-icon="inline-start" />
            Tambah Kategori
          </Button>
        }
      />
      {renderContent()}
      <CategoryFormDialog
        open={dialog.open}
        category={dialog.category}
        // Kategori tetap disimpan saat menutup agar judul tidak berubah
        // selama animasi tutup.
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
      />
    </div>
  );
}
