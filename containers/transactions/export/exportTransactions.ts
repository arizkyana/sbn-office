import "server-only";

import ExcelJS from "exceljs";
import { requireAdmin } from "@/lib/auth";
import { todayInJakarta, toJakartaDateTime } from "@/lib/date";
import { getPaymentMethodLabel } from "@/lib/payment-method";
import { createClient } from "@/lib/supabase/server";
import { paymentStatusLabel } from "@/lib/transaction";
import { applyTransactionFilters } from "../list/filters";
import {
  transactionFilterSchema,
  type TransactionFilters,
} from "../list/TransactionList.types";

// Batas satu respons PostgREST.
const BATCH_SIZE = 1000;

const DATE_TIME_FORMAT = "dd/mm/yyyy hh:mm";

/** Semua transaksi yang cocok dengan filter, diambil per 1.000 baris. */
async function fetchAllTransactions(filters: TransactionFilters) {
  const supabase = await createClient();
  const rows = [];

  for (let from = 0; ; from += BATCH_SIZE) {
    // Admin membaca semua baris lewat RLS (is_admin()), tanpa service role.
    // id sebagai pengurut kedua agar pembagian per 1.000 baris stabil.
    const { data, error } = await applyTransactionFilters(
      supabase
        .from("transactions")
        .select(
          "created_at, order_id, donor_name, is_anonymous, donor_email, donor_phone, amount, payment_method, payment_status, paid_at, campaigns (title)",
        ),
      filters,
    )
      .order("created_at")
      .order("id")
      .range(from, from + BATCH_SIZE - 1);
    if (error) throw error;

    rows.push(...data);
    if (data.length < BATCH_SIZE) return rows;
  }
}

type ExportRow = Awaited<ReturnType<typeof fetchAllTransactions>>[number];

function buildWorkbook(rows: ExportRow[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Transaksi", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    {
      header: "Tanggal (WIB)",
      key: "createdAt",
      width: 18,
      style: { numFmt: DATE_TIME_FORMAT },
    },
    { header: "Order ID", key: "orderId", width: 24 },
    { header: "Nama Donatur", key: "donorName", width: 28 },
    { header: "Anonim", key: "isAnonymous", width: 9 },
    { header: "Email", key: "donorEmail", width: 30 },
    { header: "No. HP", key: "donorPhone", width: 16 },
    { header: "Campaign", key: "campaign", width: 36 },
    { header: "Nominal", key: "amount", width: 14, style: { numFmt: "#,##0" } },
    { header: "Metode", key: "paymentMethod", width: 26 },
    { header: "Status", key: "paymentStatus", width: 13 },
    {
      header: "Waktu Bayar (WIB)",
      key: "paidAt",
      width: 18,
      style: { numFmt: DATE_TIME_FORMAT },
    },
  ];
  sheet.getRow(1).font = { bold: true };

  rows.forEach((row) => {
    sheet.addRow({
      // Sel tanggal (bukan teks) agar bisa diurutkan dan difilter di Excel.
      createdAt: toJakartaDateTime(row.created_at),
      orderId: row.order_id,
      donorName: row.donor_name,
      isAnonymous: row.is_anonymous ? "Ya" : "Tidak",
      donorEmail: row.donor_email,
      donorPhone: row.donor_phone ?? "",
      campaign: row.campaigns.title,
      amount: row.amount,
      paymentMethod: row.payment_method
        ? getPaymentMethodLabel(row.payment_method)
        : "",
      paymentStatus: paymentStatusLabel[row.payment_status],
      paidAt: row.paid_at ? toJakartaDateTime(row.paid_at) : null,
    });
  });

  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const totalRow = sheet.addRow({
    createdAt: "Total",
    // Rumus agar total ikut berubah bila baris diubah; result untuk penampil
    // yang tidak menghitung ulang rumus.
    amount:
      rows.length > 0
        ? { formula: `SUM(H2:H${rows.length + 1})`, result: total }
        : 0,
  });
  totalRow.font = { bold: true };

  return workbook;
}

/**
 * Export Excel transaksi sesuai filter aktif di halaman daftar (TRX006).
 * Route Handler tidak dilindungi layout, jadi admin dicek di sini.
 */
export async function exportTransactions(request: Request) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const parsed = transactionFilterSchema.safeParse(
    Object.fromEntries(searchParams),
  );
  if (!parsed.success) {
    return Response.json({ error: "Filter tidak valid" }, { status: 400 });
  }

  const rows = await fetchAllTransactions(parsed.data);
  const buffer = await buildWorkbook(rows).xlsx.writeBuffer();
  const filename = `transaksi-sbn-${todayInJakarta().replaceAll("-", "")}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
