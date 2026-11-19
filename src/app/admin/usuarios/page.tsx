import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/utils";
import { toggleBanAction, deleteUserAction } from "./actions";
import type { Profile } from "@/lib/types/database.types";

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const [{ data: authUsers }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers(),
    admin.from("profiles").select("*").returns<Profile[]>(),
  ]);

  const profilesById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const rows = (authUsers?.users ?? []).map((authUser) => {
    const isBanned =
      !!authUser.banned_until && new Date(authUser.banned_until) > new Date();
    return {
      id: authUser.id,
      email: authUser.email ?? "—",
      createdAt: authUser.created_at,
      isBanned,
      profile: profilesById.get(authUser.id),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usuários</h1>
        <Link href="/admin/usuarios/novo">
          <Button>Novo usuário</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário criado ainda.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Nome</TableTh>
                  <TableTh>E-mail</TableTh>
                  <TableTh>Papel</TableTh>
                  <TableTh>Criado em</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableTd>{row.profile?.full_name || "—"}</TableTd>
                    <TableTd>{row.email}</TableTd>
                    <TableTd>
                      <Badge tone={row.profile?.role === "admin" ? "solid" : "neutral"}>
                        {row.profile?.role === "admin" ? "Admin" : "Usuário"}
                      </Badge>
                    </TableTd>
                    <TableTd>{formatDateBR(row.createdAt)}</TableTd>
                    <TableTd>
                      <Badge tone={row.isBanned ? "accent" : "neutral"}>
                        {row.isBanned ? "Bloqueado" : "Ativo"}
                      </Badge>
                    </TableTd>
                    <TableTd className="flex flex-wrap justify-end gap-2">
                      <Link href={`/admin/usuarios/${row.id}`}>
                        <Button variant="secondary">Editar</Button>
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await toggleBanAction(row.id, row.isBanned);
                        }}
                      >
                        <Button type="submit" variant="secondary">
                          {row.isBanned ? "Desbloquear" : "Bloquear"}
                        </Button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await deleteUserAction(row.id);
                        }}
                      >
                        <Button type="submit" variant="destructive">
                          Excluir
                        </Button>
                      </form>
                    </TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
