import { PropsWithChildren } from "react";
import { requireAdmin } from "@/lib/auth";

// Wajib dibungkus <Suspense> karena membaca session (aturan cacheComponents).
export async function AdminGate({ children }: PropsWithChildren) {
  await requireAdmin();
  return children;
}
