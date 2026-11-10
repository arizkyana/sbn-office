"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Daftar donatur gagal dimuat.
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

    if (data.rows.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {isFiltered
              ? "Tidak ada donatur yang cocok dengan filter"
              : "Belum ada donatur terdaftar"}
          </p>
        </div>
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Donatur</h1>
        <p className="text-sm text-muted-foreground">
          Donatur yang mendaftar akun di sobatbaik.org. Donasi tanpa akun ada di
          halaman Transaksi.
        </p>
      </div>
      <DonorFilters
        values={values}
        onChange={changeFilters}
        onReset={() => changeFilters(emptyDonorFilterValues)}
      />
      {renderContent()}
    </div>
  );
}
