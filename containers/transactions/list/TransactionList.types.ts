import { z } from "zod";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/lib/transaction";

const dateSchema = z.iso.date("Format tanggal tidak valid");

/**
 * Filter daftar transaksi (TRX003) dan export Excel (TRX006). Dipakai juga untuk
 * mem-parse query string export, karena itu `campaignsId` memakai `coerce`.
 */
export const transactionFilterSchema = z
  .object({
    status: z.enum(PAYMENT_STATUSES).optional(),
    campaignsId: z.coerce.number().int().positive().optional(),
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    search: z
      .string()
      .trim()
      .max(100, "Pencarian maksimal 100 karakter")
      .optional(),
  })
  .refine(
    (filters) => !filters.from || !filters.to || filters.to >= filters.from,
    {
      path: ["to"],
      message: "Tanggal akhir tidak boleh sebelum tanggal awal",
    },
  );

export type TransactionFilters = z.infer<typeof transactionFilterSchema>;

/** Nilai field filter di halaman daftar. `"ALL"` dan string kosong berarti tanpa filter. */
export type TransactionFilterValues = {
  search: string;
  status: PaymentStatus | "ALL";
  /** Id campaign sebagai string (value Select), atau `"ALL"`. */
  campaignsId: string;
  from: string;
  to: string;
};

export const emptyTransactionFilterValues: TransactionFilterValues = {
  search: "",
  status: "ALL",
  campaignsId: "ALL",
  from: "",
  to: "",
};
