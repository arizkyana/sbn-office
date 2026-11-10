import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { z } from "zod";
import { DetailList } from "@/components/detail/DetailList";
import { DonorStatusBadge } from "@/components/donors/DonorStatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date";
import { formatRupiah } from "@/lib/utils";
import DonorActiveAction from "./components/DonorActiveAction";
import DonorTransactions from "./components/DonorTransactions";
import { getDonorById, getDonorSuccessSummary } from "./queries";

export async function DonorDetail({ id }: { id: string }) {
  // id yang formatnya salah langsung 404, tanpa query ke database.
  if (!z.uuid().safeParse(id).success) notFound();

  const [donor, summary] = await Promise.all([
    getDonorById(id),
    getDonorSuccessSummary(id),
  ]);
  if (!donor) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Detail Donatur"
        description={donor.full_name || donor.email}
        actions={
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/donors" />}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Kembali
            </Button>
            <DonorActiveAction id={donor.id} isActive={donor.is_active} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Nama", value: donor.full_name || "-" },
                { label: "Email", value: donor.email ?? "-" },
                { label: "No. HP", value: donor.phone ?? "-" },
                { label: "Terdaftar", value: formatDateTime(donor.created_at) },
                {
                  label: "Status",
                  value: <DonorStatusBadge isActive={donor.is_active} />,
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Ringkasan Donasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              items={[
                {
                  label: "Total berhasil",
                  value: formatRupiah(summary.total),
                },
                { label: "Jumlah berhasil", value: `${summary.count} donasi` },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Riwayat Donasi</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hanya donasi yang dilakukan saat donatur masuk ke akunnya.
            </p>
          </CardHeader>
          <CardContent>
            <DonorTransactions donorId={donor.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
