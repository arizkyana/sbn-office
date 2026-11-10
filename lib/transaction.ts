import { Constants, type Enums } from "@/lib/supabase/database.types";

export type PaymentStatus = Enums<"payment_status">;

export const PAYMENT_STATUSES = Constants.public.Enums.payment_status;

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  SUCCESS: "Berhasil",
  PENDING: "Menunggu",
  EXPIRED: "Kedaluwarsa",
  FAILED: "Gagal",
};

// Sama dengan riwayat donasi di sbn-donatur: Menunggu emas (warning) agar menonjol.
export const paymentStatusBadgeVariant = {
  SUCCESS: "default",
  PENDING: "warning",
  EXPIRED: "outline",
  FAILED: "destructive",
} as const satisfies Record<PaymentStatus, string>;

// Untuk `items` pada Select Base UI, agar trigger menampilkan label, bukan value.
export const paymentStatusOptions = PAYMENT_STATUSES.map((value) => ({
  value,
  label: paymentStatusLabel[value],
}));
