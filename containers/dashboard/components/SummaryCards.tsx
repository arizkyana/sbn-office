import { HandHeartIcon, UsersIcon, WalletIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
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
      label: "Total Terkumpul",
      value: formatRupiah(totalCollected),
      icon: WalletIcon,
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
          className={cn("flex-row items-center gap-4 px-4", item.cardClassName)}
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
          </div>
        </Card>
      ))}
    </div>
  );
}
