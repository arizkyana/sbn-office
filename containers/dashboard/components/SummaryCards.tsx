import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";

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
    { label: "Total Terkumpul", value: formatRupiah(totalCollected) },
    { label: "Donasi Berhasil", value: countFormatter.format(successCount) },
    // Email unik dari donasi berhasil, termasuk donatur tanpa akun (A1).
    { label: "Donatur", value: countFormatter.format(donorCount) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {item.value}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
