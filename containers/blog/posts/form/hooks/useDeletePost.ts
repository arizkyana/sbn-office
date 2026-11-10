import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePost } from "../actions";

export default function useDeletePost(uuid: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, startTransition] = useTransition();

  const remove = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(uuid);
      // Session habis: requireAdmin() melakukan redirect, tidak ada hasil.
      if (!result) return;
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Post dihapus");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      startTransition(() => router.push("/blog/posts"));
    } catch {
      toast.error("Post gagal dihapus. Coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return { remove, isPending: isDeleting || isNavigating };
}
