"use client";

import { useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
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
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Daftar kategori gagal dimuat.
          </p>
          <Button
            variant="outline"
            disabled={isRefetching}
            onClick={() => refetch()}
          >
            Coba lagi
          </Button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada kategori</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border">
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
                <TableCell className="font-mono text-xs text-muted-foreground">
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
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Kategori Blog</h1>
        <Button onClick={() => openDialog()}>
          <PlusIcon data-icon="inline-start" />
          Tambah Kategori
        </Button>
      </div>
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
