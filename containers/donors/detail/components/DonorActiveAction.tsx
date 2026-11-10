"use client";

import { useState } from "react";
import { Loader2Icon, UserCheckIcon, UserXIcon } from "lucide-react";
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
import useSetDonorActive from "../hooks/useSetDonorActive";

type DonorActiveActionProps = {
  id: string;
  isActive: boolean;
};

/** Tombol Nonaktifkan/Aktifkan dengan dialog konfirmasi (AKN011). */
export default function DonorActiveAction({
  id,
  isActive,
}: DonorActiveActionProps) {
  const [open, setOpen] = useState(false);
  const { changeActive, isPending } = useSetDonorActive(id);

  const confirm = async () => {
    const changed = await changeActive(!isActive);
    if (changed) setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant={isActive ? "destructive" : "outline"} />}
      >
        {isActive ? (
          <UserXIcon data-icon="inline-start" />
        ) : (
          <UserCheckIcon data-icon="inline-start" />
        )}
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? "Nonaktifkan donatur?" : "Aktifkan kembali donatur?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? "Donatur tidak bisa masuk ke akunnya sampai diaktifkan kembali. Riwayat donasi tetap tersimpan, dan donatur tetap bisa berdonasi tanpa login."
              : "Donatur bisa masuk lagi ke akunnya."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant={isActive ? "destructive" : "default"}
            disabled={isPending}
            onClick={confirm}
          >
            {isPending && (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            )}
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
