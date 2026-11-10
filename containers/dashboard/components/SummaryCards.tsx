import { HandHeartIcon, UsersIcon, WalletIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MIDTRANS_DASHBOARD_URL } from "@/lib/midtrans";
import { cn, formatRupiah } from "@/lib/utils";

type SummaryCardsProps = {
  totalCollected: number;
  successCount: number;
  donorCount: number;
};

const countFormatter = new Intl.NumberFormat("id-ID");

export default function SummaryCards({
  totalCollected,
  successCount,
  donorCount,
}: SummaryCardsProps) {
  const items = [
    {
      label: "Total Terkumpul (gross)",
      value: formatRupiah(totalCollected),
      icon: WalletIcon,
      // Nominal donasi sebelum dipotong biaya Midtrans; dana yang diterima
      // yayasan lebih kecil, jadi admin perlu mencocokkan dengan Midtrans.
      note: (
        <>
          Belum dipotong biaya Midtrans. Selalu cocokkan dengan{" "}
          <a
            href={MIDTRANS_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            transaksi di Midtrans
          </a>
          .
        </>
      ),
      // Angka utama: kartu bergradien seperti banner beranda donatur.
      cardClassName:
        "bg-linear-to-br from-primary to-primary-strong text-primary-foreground",
      chipClassName: "bg-white/15 text-primary-foreground",
      labelClassName: "text-primary-foreground/85",
    },
    {
      label: "Donasi Berhasil",
      value: countFormatter.format(successCount),
      icon: HandHeartIcon,
      chipClassName: "bg-primary/10 text-primary",
    },
    {
      // Email unik dari donasi berhasil, termasuk donatur tanpa akun (A1).
      label: "Donatur",
      value: countFormatter.format(donorCount),
      icon: UsersIcon,
      chipClassName: "bg-brand-gold/20 text-brand-gold-strong",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.label}
          className={cn(
            "flex-row gap-4 px-4",
            // Kartu dengan catatan lebih tinggi: ikon sejajar dengan label.
            "note" in item ? "items-start" : "items-center",
            item.cardClassName,
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              item.chipClassName,
            )}
          >
            <item.icon className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p
              className={cn(
                "text-sm text-muted-foreground",
                item.labelClassName,
              )}
            >
              {item.label}
            </p>
            <p className="truncate text-2xl font-bold tabular-nums">
              {item.value}
            </p>
            {"note" in item && (
              <p
                className={cn(
                  "mt-1 text-sm text-muted-foreground",
                  item.labelClassName,
                )}
              >
                {item.note}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
