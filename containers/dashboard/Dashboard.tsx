import Link from "next/link";
import { ArrowRightIcon, ChartBarIcon } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CampaignCollectedChart from "./components/CampaignCollectedChart";
import CampaignSummaryTable from "./components/CampaignSummaryTable";
import SummaryCards from "./components/SummaryCards";
import { getCampaignSummaries, getDashboardSummary } from "./queries";

const CHART_LIMIT = 10;

export async function Dashboard() {
  const [summary, campaigns] = await Promise.all([
    getDashboardSummary(),
    getCampaignSummaries(),
  ]);

  // campaigns sudah urut dari dana terbesar; grafik hanya yang sudah ada dananya.
  const chartRows = campaigns
    .filter((campaign) => campaign.collected > 0)
    .slice(0, CHART_LIMIT)
    .map(({ uuid, title, collected }) => ({ uuid, title, collected }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan donasi yang berhasil dari semua campaign."
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/transactions" />}
          >
            Lihat semua transaksi
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        }
      />

      <SummaryCards {...summary} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Dana Terkumpul per Campaign
          </CardTitle>
          <CardDescription>
            {CHART_LIMIT} campaign dengan dana terbesar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartRows.length > 0 ? (
            <CampaignCollectedChart rows={chartRows} />
          ) : (
            <EmptyState
              icon={ChartBarIcon}
              title="Belum ada donasi yang berhasil"
              description="Grafik muncul setelah donasi pertama berhasil dibayar."
              className="py-6"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Ringkasan per Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <CampaignSummaryTable rows={campaigns} />
        </CardContent>
      </Card>
    </div>
  );
}
