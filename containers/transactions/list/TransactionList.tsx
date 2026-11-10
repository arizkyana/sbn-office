"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import ExportButton from "./components/ExportButton";
import TransactionFilters from "./components/TransactionFilters";
import TransactionTable from "./components/TransactionTable";
import { parseTransactionFilters } from "./filters";
import useCampaignOptions from "./hooks/useCampaignOptions";
import useTransactions from "./hooks/useTransactions";
import {
  emptyTransactionFilterValues,
  type TransactionFilterValues,
} from "./TransactionList.types";

export function TransactionList() {
  const [values, setValues] = useState<TransactionFilterValues>(
    emptyTransactionFilterValues,
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(values.search.trim());

  const parsed = parseTransactionFilters({
    ...values,
    search: debouncedSearch,
  });
  const filters = parsed.success ? parsed.data : {};
  const { data, isPending, isError, isPlaceholderData, refetch, isRefetching } =
    useTransactions({ page, filters }, parsed.success);
  const { data: campaignOptions = [] } = useCampaignOptions();
  const isFiltered = Object.values(filters).some(
    (value) => value !== undefined,
  );

  const changeFilters = (changed: Partial<TransactionFilterValues>) => {
    setValues((current) => ({ ...current, ...changed }));
    setPage(1);
  };

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Daftar transaksi gagal dimuat.
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
              ? "Tidak ada transaksi yang cocok dengan filter"
              : "Belum ada transaksi"}
          </p>
        </div>
      );
    }

    return (
      <>
        <TransactionTable rows={data.rows} isStale={isPlaceholderData} />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {data.total} transaksi · Halaman {page} dari {data.totalPages}
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Transaksi</h1>
        <ExportButton filters={filters} disabled={!parsed.success} />
      </div>
      <TransactionFilters
        values={values}
        campaignOptions={campaignOptions}
        error={parsed.success ? undefined : parsed.error.issues[0]?.message}
        onChange={changeFilters}
        onReset={() => changeFilters(emptyTransactionFilterValues)}
      />
      {renderContent()}
    </div>
  );
}
