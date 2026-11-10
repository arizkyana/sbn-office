import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Client tanpa session dan tanpa cookies (RLS anon berlaku), untuk membaca data
// publik di dalam "use cache" (contoh: logo di lib/settings.ts). Cached scope tidak
// boleh memanggil cookies(), termasuk lewat lib/supabase/server.ts.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
