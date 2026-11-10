"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DonorStatusBadge } from "@/components/donors/DonorStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { DonorListItem } from "../hooks/useDonors";

type DonorTableProps = {
  rows: DonorListItem[];
  /** Menandai data halaman sebelumnya yang masih tampil saat halaman baru dimuat. */
  isStale?: boolean;
};

export default function DonorTable({ rows, isStale }: DonorTableProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "rounded-lg border transition-opacity",
        isStale && "opacity-60",
      )}
    >
      {/* Tabel bisa di-scroll horizontal di layar kecil (pembungkus bawaan Table). */}
      <Table className="min-w-200">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>No. HP</TableHead>
            <TableHead>Terdaftar</TableHead>
            <TableHead className="pr-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((donor) => {
            const href = `/donors/${donor.id}`;

            return (
              <TableRow
                key={donor.id}
                className="cursor-pointer"
                // Link di kolom Nama tetap ada untuk navigasi keyboard.
                onClick={() => router.push(href)}
              >
                <TableCell className="pl-4">
                  <Link
                    href={href}
                    className="font-medium hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {donor.full_name || "Tanpa nama"}
                  </Link>
                </TableCell>
                <TableCell>{donor.email ?? "-"}</TableCell>
                <TableCell>{donor.phone ?? "-"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(donor.created_at)}
                </TableCell>
                <TableCell className="pr-4">
                  <DonorStatusBadge isActive={donor.is_active} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
