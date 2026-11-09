import { redirect } from "next/navigation";
import { getCurrentUser, isActiveAdmin } from "@/lib/auth";

// Admin yang sudah login tidak perlu melihat halaman login lagi.
// Tidak dilakukan di proxy karena proxy tidak tahu role user.
export async function RedirectIfAdmin() {
  const user = await getCurrentUser();
  if (isActiveAdmin(user)) redirect("/");
  return null;
}
