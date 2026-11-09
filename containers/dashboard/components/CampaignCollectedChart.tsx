"use client";

import { useMemo } from "react";
import { barX, defineChart } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { formatRupiah } from "@/lib/utils";

export type CampaignCollectedRow = {
  uuid: string;
  title: string;
  collected: number;
};

const compactFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const MAX_LABEL_LENGTH = 28;

function truncate(text: string) {
  return text.length > MAX_LABEL_LENGTH
    ? `${text.slice(0, MAX_LABEL_LENGTH - 1)}…`
    : text;
}

/** Grafik batang horizontal dana terkumpul. `rows` sudah urut dari yang terbesar. */
export default function CampaignCollectedChart({
  rows,
}: {
  rows: CampaignCollectedRow[];
}) {
  const definition = useMemo(() => {
    // Sumbu y memakai uuid agar campaign dengan judul sama tidak tergabung.
    const titleByUuid = new Map(rows.map((row) => [row.uuid, row.title]));

    return defineChart({
      marks: [
        barX(rows, {
          x: "collected",
          y: "uuid",
          fill: "var(--chart-1)",
          inset: 2,
          radius: 3,
        }),
      ],
      scales: {
        x: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: {
            ticks: { format: (value) => `Rp${compactFormatter.format(value)}` },
          },
        },
        y: {
          scale: () =>
            scaleBand<string>()
              .domain(rows.map((row) => row.uuid))
              .paddingInner(0.2)
              .paddingOuter(0.1),
          axis: {
            ticks: {
              format: (value) => truncate(titleByUuid.get(value) ?? ""),
            },
          },
        },
      },
      tooltip: {
        use: tooltip,
        format: (point) =>
          `${point.datum.title}: ${formatRupiah(point.datum.collected)}`,
      },
    });
  }, [rows]);

  return (
    <Chart
      definition={definition}
      height={Math.max(160, rows.length * 40 + 48)}
      ariaLabel="Dana terkumpul per campaign"
      className="text-muted-foreground"
    />
  );
}
