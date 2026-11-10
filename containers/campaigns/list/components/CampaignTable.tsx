import Image from "next/image";
import Link from "next/link";
import { ImageIcon, PencilIcon } from "lucide-react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { TableCard } from "@/components/data/TableCard";
import { Button } from "@/components/ui/button";
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
import type { CampaignListItem } from "../hooks/useCampaigns";

type CampaignTableProps = {
  rows: CampaignListItem[];
  /** Menandai data halaman sebelumnya yang masih tampil saat halaman baru dimuat. */
  isStale?: boolean;
};

export default function CampaignTable({ rows, isStale }: CampaignTableProps) {
  return (
    <TableCard isStale={isStale}>
      {/* Tabel bisa di-scroll horizontal di layar kecil (pembungkus bawaan Table). */}
      <Table className="min-w-190">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Terkumpul</TableHead>
            <TableHead>Berakhir</TableHead>
            <TableHead className="pr-4 text-right">
              <span className="sr-only">Aksi</span>
            </TableHead>
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
                  <div className="flex min-w-64 items-center gap-3">
                    <div className="relative flex aspect-video w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {campaign.cover ? (
                        <Image
                          src={campaign.cover}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="line-clamp-2 font-medium whitespace-normal">
                      {campaign.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell>
                  <div className="flex w-52 flex-col gap-1.5">
                    <span>
                      {formatRupiah(campaign.collected)}
                      {campaign.target_budget && (
                        <span className="text-muted-foreground">
                          {" / "}
                          {formatRupiah(campaign.target_budget)}
                        </span>
                      )}
                    </span>
                    {percent === null ? (
                      <span className="text-sm text-muted-foreground">
                        Tanpa target
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
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
                  </div>
                </TableCell>
                <TableCell>
                  {campaign.end_date ? (
                    formatDate(campaign.end_date)
                  ) : (
                    <span className="text-muted-foreground">Tanpa batas</span>
                  )}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/campaigns/${campaign.uuid}`} />}
                  >
                    <PencilIcon data-icon="inline-start" />
                    Ubah
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableCard>
  );
}
