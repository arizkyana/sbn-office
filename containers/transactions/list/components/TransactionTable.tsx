"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TransactionStatusBadge } from "@/components/transactions/TransactionStatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/date";
import { getPaymentMethodLabel } from "@/lib/payment-method";
import { cn, formatRupiah } from "@/lib/utils";
import type { TransactionListItem } from "../hooks/useTransactions";

type TransactionTableProps = {
  rows: TransactionListItem[];
  /** Menandai data halaman sebelumnya yang masih tampil saat halaman baru dimuat. */
  isStale?: boolean;
};

export default function TransactionTable({
  rows,
  isStale,
}: TransactionTableProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "rounded-lg border transition-opacity",
        isStale && "opacity-60",
      )}
    >
      {/* Tabel bisa di-scroll horizontal di layar kecil (pembungkus bawaan Table). */}
      <Table className="min-w-240">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Tanggal</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Donatur</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead className="pr-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((transaction) => {
            const href = `/transactions/${transaction.uuid}`;

            return (
              <TableRow
                key={transaction.uuid}
                className="cursor-pointer"
                // Link di kolom Order ID tetap ada untuk navigasi keyboard.
                onClick={() => router.push(href)}
              >
                <TableCell className="pl-4 text-muted-foreground">
                  {formatDateTime(transaction.created_at)}
                </TableCell>
                <TableCell>
                  <Link
                    href={href}
                    className="font-mono text-xs font-medium hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {transaction.order_id}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      {transaction.donor_name}
                      {transaction.is_anonymous && (
                        <Badge variant="outline">Anonim</Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {transaction.donor_email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-2 max-w-56 whitespace-normal">
                    {transaction.campaigns.title}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(transaction.amount)}
                </TableCell>
                <TableCell>
                  {getPaymentMethodLabel(transaction.payment_method)}
                </TableCell>
                <TableCell className="pr-4">
                  <TransactionStatusBadge status={transaction.payment_status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
