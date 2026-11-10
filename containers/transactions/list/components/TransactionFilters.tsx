"use client";

import { RotateCcwIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentStatusOptions } from "@/lib/transaction";
import type { TransactionFilterValues } from "../TransactionList.types";

const statusFilterOptions: {
  value: TransactionFilterValues["status"];
  label: string;
}[] = [{ value: "ALL", label: "Semua status" }, ...paymentStatusOptions];

type TransactionFiltersProps = {
  values: TransactionFilterValues;
  campaignOptions: { value: string; label: string }[];
  /** Pesan bila filter tidak valid, contoh rentang tanggal terbalik. */
  error?: string;
  onChange: (values: Partial<TransactionFilterValues>) => void;
  onReset: () => void;
};

export default function TransactionFilters({
  values,
  campaignOptions,
  error,
  onChange,
  onReset,
}: TransactionFiltersProps) {
  const campaignFilterOptions: {
    value: TransactionFilterValues["campaignsId"];
    label: string;
  }[] = [{ value: "ALL", label: "Semua campaign" }, ...campaignOptions];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari order ID, nama, atau email"
            aria-label="Cari order ID, nama, atau email"
            className="pl-8"
            maxLength={100}
            value={values.search}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </div>
        <Select
          items={statusFilterOptions}
          value={values.status}
          onValueChange={(value) => value && onChange({ status: value })}
        >
          <SelectTrigger aria-label="Filter status" className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={campaignFilterOptions}
          value={values.campaignsId}
          onValueChange={(value) => value && onChange({ campaignsId: value })}
        >
          <SelectTrigger
            aria-label="Filter campaign"
            className="w-full sm:w-56"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {campaignFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            type="date"
            aria-label="Dari tanggal"
            className="flex-1 sm:w-38"
            max={values.to || undefined}
            value={values.from}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange({ from: event.target.value })}
          />
          <span className="text-sm text-muted-foreground">s.d.</span>
          <Input
            type="date"
            aria-label="Sampai tanggal"
            className="flex-1 sm:w-38"
            min={values.from || undefined}
            value={values.to}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange({ to: event.target.value })}
          />
        </div>
        <Button variant="outline" onClick={onReset}>
          <RotateCcwIcon data-icon="inline-start" />
          Reset
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
