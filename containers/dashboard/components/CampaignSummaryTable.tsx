import Link from "next/link";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProgressPercent } from "@/lib/campaign";
import { formatDate } from "@/lib/date";
import { formatRupiah } from "@/lib/utils";
import type { CampaignSummary } from "../queries";

/** Ringkasan per campaign, urut dari dana terkumpul terbesar. */
export default function CampaignSummaryTable({
  rows,
}: {
  rows: CampaignSummary[];
}) {
  if (rows.length === 0) {
    return (
      <p className="px-4 text-sm text-muted-foreground">Belum ada campaign</p>
    );
  }

  return (
    // Tabel bisa di-scroll horizontal di layar kecil (pembungkus bawaan Table).
    <Table className="min-w-200">
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Terkumpul</TableHead>
          <TableHead className="text-right">Progres</TableHead>
          <TableHead className="text-right">Donasi</TableHead>
          <TableHead className="pr-4">Berakhir</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((campaign) => {
          const percent = getProgressPercent(
            campaign.collected,
            campaign.target_budget,
          );

          return (
            <TableRow key={campaign.uuid}>
              <TableCell className="pl-4">
                <Link
                  href={`/campaigns/${campaign.uuid}`}
                  className="line-clamp-2 max-w-72 font-medium whitespace-normal hover:underline"
                >
                  {campaign.title}
                </Link>
              </TableCell>
              <TableCell>
                <CampaignStatusBadge status={campaign.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {campaign.target_budget ? (
                  formatRupiah(campaign.target_budget)
                ) : (
                  <span className="text-muted-foreground">Tanpa target</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatRupiah(campaign.collected)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {percent === null ? "-" : `${percent}%`}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {campaign.successCount}
              </TableCell>
              <TableCell className="pr-4">
                {campaign.end_date ? (
                  formatDate(campaign.end_date)
                ) : (
                  <span className="text-muted-foreground">Tanpa batas</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
