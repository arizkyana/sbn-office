import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildTransactionFilterParams } from "../filters";
import type { TransactionFilters } from "../TransactionList.types";

type ExportButtonProps = {
  filters: TransactionFilters;
  disabled?: boolean;
};

/**
 * Link biasa (bukan Server Action) agar browser langsung mengunduh file dari
 * Route Handler `/transactions/export` dengan filter yang sedang aktif.
 */
export default function ExportButton({ filters, disabled }: ExportButtonProps) {
  if (disabled) {
    return (
      <Button variant="outline" disabled>
        <DownloadIcon data-icon="inline-start" />
        Export Excel
      </Button>
    );
  }

  const params = buildTransactionFilterParams(filters).toString();
  return (
    <Button
      variant="outline"
      nativeButton={false}
      render={<a href={`/transactions/export${params ? `?${params}` : ""}`} />}
    >
      <DownloadIcon data-icon="inline-start" />
      Export Excel
    </Button>
  );
}
