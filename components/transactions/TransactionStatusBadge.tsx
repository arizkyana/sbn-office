import { Badge } from "@/components/ui/badge";
import {
  paymentStatusBadgeVariant,
  paymentStatusLabel,
  type PaymentStatus,
} from "@/lib/transaction";

export function TransactionStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={paymentStatusBadgeVariant[status]}>
      {paymentStatusLabel[status]}
    </Badge>
  );
}
