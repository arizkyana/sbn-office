"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  getPaidAt,
  getTransactionStatus,
  mapPaymentStatus,
} from "@/lib/midtrans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, TablesUpdate } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/lib/transaction";
import type { ActionResult } from "@/lib/types";

// Sama dengan expiry Snap (24 jam) di sbn-donatur.
const PAYMENT_EXPIRY_MS = 24 * 60 * 60 * 1000;

type RecheckResult = ActionResult<{ status: PaymentStatus }>;

/**
 * Update hanya bila transaksi masih PENDING, sama dengan webhook di
 * `sbn-donatur/containers/donation/notification/handler.ts`, jadi aman bila
 * webhook masuk bersamaan. Transaksi lewat admin client: tidak ada policy update.
 */
async function updatePendingTransaction(
  orderId: string,
  values: TablesUpdate<"transactions">,
) {
  const admin = createAdminClient();
  return admin
    .from("transactions")
    .update(values)
    .eq("order_id", orderId)
    .eq("payment_status", "PENDING")
    .select("payment_status")
    .maybeSingle();
}

/**
 * Cek ulang status ke Midtrans untuk transaksi PENDING (TRX005). Tidak mengirim
 * email bukti donasi; email hanya dikirim webhook.
 */
export async function recheckTransactionStatus(
  uuid: string,
): Promise<RecheckResult> {
  await requireAdmin();

  if (!z.uuid().safeParse(uuid).success) {
    return { success: false, message: "Transaksi tidak ditemukan" };
  }

  const supabase = await createClient();
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select("order_id, amount, payment_status, created_at")
    .eq("uuid", uuid)
    .maybeSingle();
  if (error) {
    return { success: false, message: "Transaksi gagal dimuat. Coba lagi." };
  }
  if (!transaction) {
    return { success: false, message: "Transaksi tidak ditemukan" };
  }
  if (transaction.payment_status !== "PENDING") {
    return { success: false, message: "Status transaksi sudah final" };
  }

  let status;
  try {
    status = await getTransactionStatus(transaction.order_id);
  } catch {
    return {
      success: false,
      message: "Midtrans belum bisa dihubungi. Coba lagi.",
    };
  }

  let values: TablesUpdate<"transactions">;
  if (!status) {
    // Tidak dikenal Midtrans: donatur tidak pernah memilih metode bayar (A3).
    const age = Date.now() - new Date(transaction.created_at).getTime();
    if (age <= PAYMENT_EXPIRY_MS) {
      return {
        success: false,
        message: "Belum ada pembayaran untuk transaksi ini di Midtrans",
      };
    }
    values = { payment_status: "EXPIRED" };
  } else {
    if (Math.round(Number(status.gross_amount)) !== transaction.amount) {
      return {
        success: false,
        message:
          "Nominal di Midtrans tidak sesuai, periksa di dashboard Midtrans",
      };
    }

    const paymentStatus = mapPaymentStatus(
      status.transaction_status,
      status.fraud_status,
    );
    values = {
      payment_method: status.payment_type ?? null,
      midtrans_payload: status as Json,
    };
    // Masih menunggu (atau status di luar scope): status tetap PENDING.
    if (paymentStatus && paymentStatus !== "PENDING") {
      values.payment_status = paymentStatus;
      values.paid_at =
        paymentStatus === "SUCCESS"
          ? getPaidAt(status.settlement_time, new Date())
          : null;
    }
  }

  const { data: updated, error: updateError } = await updatePendingTransaction(
    transaction.order_id,
    values,
  );
  if (updateError) {
    console.error(
      `Cek ulang status ${transaction.order_id} gagal disimpan:`,
      updateError.message,
    );
    return { success: false, message: "Status gagal disimpan. Coba lagi." };
  }

  revalidatePath(`/transactions/${uuid}`);
  // Baris tidak berubah: webhook sudah lebih dulu memfinalkan transaksi.
  if (!updated) {
    return { success: false, message: "Status transaksi sudah final" };
  }
  if (updated.payment_status === "PENDING") {
    return { success: false, message: "Pembayaran masih menunggu" };
  }
  return { success: true, data: { status: updated.payment_status } };
}
