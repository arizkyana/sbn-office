"use client";

import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useRecheckStatus from "../hooks/useRecheckStatus";

export default function RecheckStatusButton({ uuid }: { uuid: string }) {
  const { recheck, isChecking } = useRecheckStatus(uuid);

  return (
    <Button disabled={isChecking} onClick={recheck}>
      {isChecking ? (
        <Loader2Icon data-icon="inline-start" className="animate-spin" />
      ) : (
        <RefreshCwIcon data-icon="inline-start" />
      )}
      Cek Ulang Status
    </Button>
  );
}
