import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database.types";

/**
 * Retorna o usuário autenticado e seu profile (com role).
 * Usado tanto para exibir/ocultar UI quanto como checagem de autorização
 * no início de Server Actions sensíveis (nunca confie só na UI).
 */
export async function getCurrentUserAndProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
}
