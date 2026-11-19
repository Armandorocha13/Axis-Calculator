import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

/**
 * Client com a service role key — bypassa Row Level Security.
 * Só pode ser importado por Server Actions dentro de src/app/admin/**.
 * Nunca importe este arquivo em Client Components ou em código que
 * roda no browser: a service role key concede acesso total ao banco.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
