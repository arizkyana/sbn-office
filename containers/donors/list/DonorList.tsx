"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  SearchXIcon,
  UsersIcon,
} from "lucide-react";
import { TableCard } from "@/components/data/TableCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import DonorFilters from "./components/DonorFilters";
import DonorTable from "./components/DonorTable";
import {
  emptyDonorFilterValues,
  type DonorFilterValues,
} from "./DonorList.types";
import useDonors from "./hooks/useDonors";

export function DonorList() {
  const [values, setValues] = useState<DonorFilterValues>(
    emptyDonorFilterValues,
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(values.search.trim());

  const { data, isPending, isError, isPlaceholderData, refetch, isRefetching } =
    useDonors({ page, search: debouncedSearch, status: values.status });
  const isFiltered = debouncedSearch !== "" || values.status !== "ALL";

  const changeFilters = (changed: Partial<DonorFilterValues>) => {
    setValues((current) => ({ ...current, ...changed }));
    setPage(1);
  };

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
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
            title="Daftar donatur gagal dimuat"
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
              title="Tidak ada donatur yang cocok"
              description="Coba kata kunci atau status lain."
              action={
                <Button
                  variant="outline"
                  onClick={() => changeFilters(emptyDonorFilterValues)}
                >
                  Reset filter
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={UsersIcon}
              title="Belum ada donatur terdaftar"
              description="Donatur yang membuat akun di website akan tampil di sini."
            />
          )}
        </TableCard>
      );
    }

    return (
      <>
        <DonorTable rows={data.rows} isStale={isPlaceholderData} />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {data.total} donatur · Halaman {page} dari {data.totalPages}
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
        title="Donatur"
        description="Donatur yang mendaftar akun di sobatbaik.org. Donasi tanpa akun ada di halaman Transaksi."
      />
      <DonorFilters
        values={values}
        onChange={changeFilters}
        onReset={() => changeFilters(emptyDonorFilterValues)}
      />
      {renderContent()}
    </div>
  );
}
