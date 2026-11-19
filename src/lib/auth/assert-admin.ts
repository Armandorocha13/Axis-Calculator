import "server-only";
import { getCurrentUserAndProfile } from "@/lib/auth/get-current-profile";

/**
 * Reconfirma a role=admin do usuário autenticado (via client com RLS,
 * nunca via admin.ts) antes de permitir qualquer Server Action de /admin.
 * Necessário mesmo com o /admin/layout.tsx já checando isso, caso a action
 * seja invocada diretamente.
 */
export async function assertIsAdmin() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || profile?.role !== "admin") {
    throw new Error("Acesso não autorizado.");
  }
  return { user, profile };
}
