// Salinan `sbn-donatur/lib/payment-method.ts`. `payment_type` dari Midtrans.
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Transfer bank (Virtual Account)",
  echannel: "Mandiri Bill Payment",
  permata: "Permata Virtual Account",
  qris: "QRIS",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  credit_card: "Kartu kredit",
  cstore: "Gerai retail",
  akulaku: "Akulaku",
  kredivo: "Kredivo",
};

export function getPaymentMethodLabel(paymentType: string | null) {
  if (!paymentType) return "-";
  return PAYMENT_METHOD_LABELS[paymentType] ?? paymentType;
}
