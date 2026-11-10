"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TableCard } from "@/components/data/TableCard";
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
import type { Tables } from "@/lib/supabase/database.types";
import { formatRupiah } from "@/lib/utils";

/** Kolom yang dibutuhkan tabel; cocok dengan select daftar transaksi dan riwayat donatur. */
export type TransactionTableRow = Pick<
  Tables<"transactions">,
  | "uuid"
  | "order_id"
  | "created_at"
  | "donor_name"
  | "donor_email"
  | "is_anonymous"
  | "amount"
  | "payment_method"
  | "payment_status"
> & { campaigns: { title: string } };

type TransactionTableProps = {
  rows: TransactionTableRow[];
  /** Menandai data halaman sebelumnya yang masih tampil saat halaman baru dimuat. */
  isStale?: boolean;
  /** `false` di riwayat satu donatur (AKN010), karena kolom Donatur selalu sama. */
  showDonor?: boolean;
  /** Contoh `shadow-none border` saat tabel sudah berada di dalam Card. */
  className?: string;
};

// Dipakai daftar transaksi (TRX003) dan riwayat donasi di detail donatur (AKN010).
export function TransactionTable({
  rows,
  isStale,
  showDonor = true,
  className,
}: TransactionTableProps) {
  const router = useRouter();

  return (
    <TableCard isStale={isStale} className={className}>
      {/* Tabel bisa di-scroll horizontal di layar kecil (pembungkus bawaan Table). */}
      <Table className="min-w-240">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Tanggal</TableHead>
            <TableHead>Order ID</TableHead>
            {showDonor && <TableHead>Donatur</TableHead>}
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
                    className="font-mono text-sm font-medium hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {transaction.order_id}
                  </Link>
                </TableCell>
                {showDonor && (
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        {transaction.donor_name}
                        {transaction.is_anonymous && (
                          <Badge variant="outline">Anonim</Badge>
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {transaction.donor_email}
                      </span>
                    </div>
                  </TableCell>
                )}
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
    </TableCard>
  );
}
