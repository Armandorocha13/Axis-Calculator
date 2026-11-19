import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserForm } from "@/components/admin/create-user-form";

export default function NewUserPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Novo usuário</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados de acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>
    </div>
  );
}
