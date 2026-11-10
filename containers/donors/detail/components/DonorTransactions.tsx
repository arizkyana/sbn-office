"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  ReceiptTextIcon,
} from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useDonorTransactions from "../hooks/useDonorTransactions";

export default function DonorTransactions({ donorId }: { donorId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isPlaceholderData, refetch, isRefetching } =
    useDonorTransactions({ donorId, page });

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
      <EmptyState
        icon={CircleAlertIcon}
        title="Riwayat donasi gagal dimuat"
        className="py-6"
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
    );
  }

  if (data.rows.length === 0) {
    return (
      <EmptyState
        icon={ReceiptTextIcon}
        title="Belum ada donasi dari akun ini"
        className="py-6"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TransactionTable
        rows={data.rows}
        isStale={isPlaceholderData}
        showDonor={false}
        // Sudah di dalam Card "Riwayat Donasi": cukup garis, tanpa shadow kedua.
        className="border shadow-none"
      />
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {data.total} donasi · Halaman {page} dari {data.totalPages}
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
    </div>
  );
}
