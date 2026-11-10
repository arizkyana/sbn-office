import { Constants, type Enums } from "@/lib/supabase/database.types";

export type PaymentStatus = Enums<"payment_status">;

export const PAYMENT_STATUSES = Constants.public.Enums.payment_status;

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  SUCCESS: "Berhasil",
  PENDING: "Menunggu",
  EXPIRED: "Kedaluwarsa",
  FAILED: "Gagal",
};

// Badge tidak punya varian sukses/peringatan; "default" memakai warna primary (hijau).
export const paymentStatusBadgeVariant = {
  SUCCESS: "default",
  PENDING: "secondary",
  EXPIRED: "outline",
  FAILED: "destructive",
} as const satisfies Record<PaymentStatus, string>;

// Untuk `items` pada Select Base UI, agar trigger menampilkan label, bukan value.
export const paymentStatusOptions = PAYMENT_STATUSES.map((value) => ({
  value,
  label: paymentStatusLabel[value],
}));
