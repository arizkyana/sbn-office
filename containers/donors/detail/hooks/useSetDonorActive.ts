import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { setDonorActive } from "../actions";

export default function useSetDonorActive(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  /** Mengembalikan `true` bila berhasil, agar dialog bisa ditutup. */
  const changeActive = async (active: boolean) => {
    setIsPending(true);
    try {
      const result = await setDonorActive(id, active);
      // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
      if (!result) return false;
      if (!result.success) {
        toast.error(result.message);
        return false;
      }

      toast.success(
        active ? "Donatur diaktifkan kembali" : "Donatur dinonaktifkan",
      );
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      router.refresh();
      return true;
    } catch {
      toast.error("Status akun gagal diubah. Coba lagi.");
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { changeActive, isPending };
}
