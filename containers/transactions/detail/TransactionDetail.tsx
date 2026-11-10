import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { z } from "zod";
import { DetailList } from "@/components/detail/DetailList";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionStatusBadge } from "@/components/transactions/TransactionStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date";
import { getPaymentMethodLabel } from "@/lib/payment-method";
import { formatRupiah } from "@/lib/utils";
import RecheckStatusButton from "./components/RecheckStatusButton";
import { getTransactionByUuid } from "./queries";

export async function TransactionDetail({ uuid }: { uuid: string }) {
  // uuid yang formatnya salah langsung 404, tanpa query ke database.
  if (!z.uuid().safeParse(uuid).success) notFound();

  const transaction = await getTransactionByUuid(uuid);
  if (!transaction) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Detail Transaksi"
        description={<span className="font-mono">{transaction.order_id}</span>}
        actions={
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/transactions" />}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Kembali
            </Button>
            {/* Transaksi final tidak berubah lagi (UC03). */}
            {transaction.payment_status === "PENDING" && (
              <RecheckStatusButton uuid={transaction.uuid} />
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Donasi</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Order ID", value: transaction.order_id },
                {
                  label: "Status",
                  value: (
                    <TransactionStatusBadge
                      status={transaction.payment_status}
                    />
                  ),
                },
                { label: "Nominal", value: formatRupiah(transaction.amount) },
                {
                  label: "Campaign",
                  value: (
                    <Link
                      href={`/campaigns/${transaction.campaigns.uuid}`}
                      className="hover:underline"
                    >
                      {transaction.campaigns.title}
                    </Link>
                  ),
                },
                {
                  label: "Dibuat",
                  value: formatDateTime(transaction.created_at),
                },
                {
                  label: "Dibayar",
                  value: transaction.paid_at
                    ? formatDateTime(transaction.paid_at)
                    : "-",
                },
                {
                  label: "Metode",
                  value: getPaymentMethodLabel(transaction.payment_method),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Donatur</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Nama", value: transaction.donor_name },
                {
                  label: "Anonim",
                  value: transaction.is_anonymous ? "Ya" : "Tidak",
                },
                { label: "Email", value: transaction.donor_email },
                { label: "No. HP", value: transaction.donor_phone ?? "-" },
                {
                  label: "Akun",
                  value: transaction.users_id ? (
                    <Link
                      href={`/donors/${transaction.users_id}`}
                      className="hover:underline"
                    >
                      Lihat akun donatur
                    </Link>
                  ) : (
                    "Tanpa akun"
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Midtrans</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DetailList
              items={[
                {
                  label: "Link pembayaran",
                  value: transaction.payment_url ? (
                    <a
                      href={transaction.payment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      Buka halaman pembayaran
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  ) : (
                    "-"
                  ),
                },
              ]}
            />
            {transaction.midtrans_payload ? (
              <details className="rounded-lg border">
                <summary className="cursor-pointer px-3 py-2 font-medium">
                  Respons terakhir Midtrans
                </summary>
                <pre className="overflow-x-auto border-t bg-muted/50 p-3 font-mono text-xs">
                  {JSON.stringify(transaction.midtrans_payload, null, 2)}
                </pre>
              </details>
            ) : (
              <p className="text-muted-foreground">
                Belum ada respons dari Midtrans.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
