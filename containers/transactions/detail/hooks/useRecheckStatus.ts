import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentStatusLabel } from "@/lib/transaction";
import { recheckTransactionStatus } from "../actions";

export default function useRecheckStatus(uuid: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);

  const recheck = async () => {
    setIsChecking(true);
    try {
      const result = await recheckTransactionStatus(uuid);
      // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
      if (!result) return;

      if (result.success && result.data) {
        toast.success(
          `Status diperbarui menjadi ${paymentStatusLabel[result.data.status]}`,
        );
      } else if (!result.success) {
        // Bukan selalu error, contoh "Pembayaran masih menunggu".
        toast(result.message);
      }
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      router.refresh();
    } catch {
      toast.error("Status gagal dicek. Coba lagi.");
    } finally {
      setIsChecking(false);
    }
  };

  return { recheck, isChecking };
}
