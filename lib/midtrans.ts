import "server-only";

import type { Enums } from "@/lib/supabase/database.types";

// Salinan sebagian `sbn-donatur/lib/midtrans.ts`: office hanya membaca status
// lewat Core API untuk tombol cek ulang status. Snap dan webhook ada di donatur.
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const CORE_BASE_URL = IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

/** Dashboard Midtrans sesuai environment, untuk mencocokkan transaksi dan biaya. */
export const MIDTRANS_DASHBOARD_URL = IS_PRODUCTION
  ? "https://dashboard.midtrans.com"
  : "https://dashboard.sandbox.midtrans.com";

function getServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum diatur");
  return serverKey;
}

function getAuthHeaders() {
  return {
    Authorization: `Basic ${Buffer.from(`${getServerKey()}:`).toString("base64")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Respons GET status Core API (field yang dipakai cek ulang status). */
export type MidtransTransactionStatus = {
  order_id: string;
  status_code: string;
  transaction_status: string;
  fraud_status?: string;
  gross_amount: string;
  payment_type?: string;
  settlement_time?: string;
};

/**
 * Status transaksi langsung dari Midtrans. `null` bila Midtrans tidak mengenal
 * order_id, misalnya donatur membuka halaman Midtrans tanpa memilih metode bayar.
 */
export async function getTransactionStatus(orderId: string) {
  const response = await fetch(
    `${CORE_BASE_URL}/v2/${encodeURIComponent(orderId)}/status`,
    { headers: getAuthHeaders() },
  );
  if (!response.ok) {
    console.error(
      `Midtrans GET status gagal (${response.status}) untuk ${orderId}:`,
      await response.text(),
    );
    throw new Error(
      `Midtrans GET status gagal dengan status ${response.status}`,
    );
  }

  const data = (await response.json()) as MidtransTransactionStatus;
  // Transaksi tidak ditemukan tetap dibalas HTTP 200, dengan status_code "404".
  if (data.status_code === "404") return null;
  return data;
}

/**
 * `transaction_status` Midtrans → `payment_status`. `null` untuk status di luar
 * scope (refund, chargeback, dll.).
 */
export function mapPaymentStatus(
  transactionStatus: string,
  fraudStatus?: string,
): Enums<"payment_status"> | null {
  switch (transactionStatus) {
    case "settlement":
      return "SUCCESS";
    case "capture":
      // Kartu kredit: challenge berarti masih menunggu review fraud di dashboard Midtrans.
      if (fraudStatus === "accept") return "SUCCESS";
      if (fraudStatus === "challenge") return "PENDING";
      return null;
    case "pending":
      return "PENDING";
    case "expire":
      return "EXPIRED";
    case "cancel":
    case "deny":
    case "failure":
      return "FAILED";
    default:
      return null;
  }
}

const SETTLEMENT_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/**
 * Waktu bayar untuk `paid_at`. `settlement_time` dikirim dalam WIB tanpa offset
 * (contoh `"2026-11-09 10:00:00"`); bila tidak ada, pakai waktu sekarang.
 */
export function getPaidAt(settlementTime: string | undefined, now: Date) {
  if (settlementTime && SETTLEMENT_TIME_PATTERN.test(settlementTime)) {
    return new Date(`${settlementTime.replace(" ", "T")}+07:00`).toISOString();
  }
  return now.toISOString();
}
