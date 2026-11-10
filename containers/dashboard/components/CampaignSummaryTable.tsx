import Link from "next/link";
import { HeartHandshakeIcon } from "lucide-react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Progress } from "@/components/ui/progress";
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
      <EmptyState
        icon={HeartHandshakeIcon}
        title="Belum ada campaign"
        description="Campaign yang dibuat akan tampil di sini."
        className="py-6"
      />
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
          <TableHead>Progres</TableHead>
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
              <TableCell>
                {percent === null ? (
                  <span className="text-muted-foreground">Tanpa target</span>
                ) : (
                  <div className="flex w-36 items-center gap-2">
                    <Progress
                      value={percent}
                      aria-label={`Progres ${campaign.title}`}
                      // Bar emas, sama dengan CampaignProgress di sbn-donatur.
                      className="flex-1 **:data-[slot=progress-indicator]:bg-brand-gold"
                    />
                    <span className="text-sm font-semibold tabular-nums">
                      {percent}%
                    </span>
                  </div>
                )}
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
