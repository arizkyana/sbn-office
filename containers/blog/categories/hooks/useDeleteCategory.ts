import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCategory } from "../actions";

export default function useDeleteCategory(uuid: string) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  /** Mengembalikan `true` bila berhasil, agar dialog bisa ditutup. */
  const remove = async () => {
    setIsPending(true);
    try {
      const result = await deleteCategory(uuid);
      // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
      if (!result) return false;
      if (!result.success) {
        toast.error(result.message);
        return false;
      }

      toast.success("Kategori dihapus");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      return true;
    } catch {
      toast.error("Kategori gagal dihapus. Coba lagi.");
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { remove, isPending };
}
