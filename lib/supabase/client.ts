import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Hanya untuk membaca data lewat Tanstack Query. Penulisan data lewat Server Action.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
