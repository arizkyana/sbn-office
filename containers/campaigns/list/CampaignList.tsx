"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import CampaignFilters from "./components/CampaignFilters";
import CampaignTable from "./components/CampaignTable";
import useCampaigns, { type CampaignStatusFilter } from "./hooks/useCampaigns";

function AddCampaignButton() {
  return (
    <Button nativeButton={false} render={<Link href="/campaigns/new" />}>
      <PlusIcon data-icon="inline-start" />
      Tambah Campaign
    </Button>
  );
}

export function CampaignList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CampaignStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const { data, isPending, isError, isPlaceholderData, refetch, isRefetching } =
    useCampaigns({ page, search: debouncedSearch, status });
  const isFiltered = debouncedSearch !== "" || status !== "ALL";

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
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Daftar campaign gagal dimuat.
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
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {isFiltered ? "Campaign tidak ditemukan" : "Belum ada campaign"}
          </p>
          {!isFiltered && <AddCampaignButton />}
        </div>
      );
    }

    return (
      <>
        <CampaignTable rows={data.rows} isStale={isPlaceholderData} />
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Campaign</h1>
        <AddCampaignButton />
      </div>
      <CampaignFilters
        search={search}
        status={status}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
      />
      {renderContent()}
    </div>
  );
}
