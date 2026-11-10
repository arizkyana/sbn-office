"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  ReceiptTextIcon,
  SearchXIcon,
} from "lucide-react";
import { TableCard } from "@/components/data/TableCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import ExportButton from "./components/ExportButton";
import TransactionFilters from "./components/TransactionFilters";
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
        <TableCard>
          <EmptyState
            icon={CircleAlertIcon}
            title="Daftar transaksi gagal dimuat"
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
              title="Tidak ada transaksi yang cocok"
              description="Coba ubah kata kunci, status, campaign, atau rentang tanggal."
              action={
                <Button
                  variant="outline"
                  onClick={() => changeFilters(emptyTransactionFilterValues)}
                >
                  Reset filter
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ReceiptTextIcon}
              title="Belum ada transaksi"
              description="Donasi dari website donatur akan tampil di sini."
            />
          )}
        </TableCard>
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
      <PageHeader
        title="Transaksi"
        description="Pantau donasi dan status pembayaran dari Midtrans."
        actions={<ExportButton filters={filters} disabled={!parsed.success} />}
      />
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
