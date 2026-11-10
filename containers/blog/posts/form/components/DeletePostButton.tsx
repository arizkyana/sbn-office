"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useDeletePost from "../hooks/useDeletePost";

/** Tombol Hapus di halaman ubah post, dengan dialog konfirmasi. */
export default function DeletePostButton({ uuid }: { uuid: string }) {
  const { remove, isPending } = useDeletePost(uuid);

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        <Trash2Icon data-icon="inline-start" />
        Hapus
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus post?</AlertDialogTitle>
          <AlertDialogDescription>
            Post akan dihapus permanen dan tidak tampil lagi di blog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={remove}
          >
            {isPending && (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            )}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
