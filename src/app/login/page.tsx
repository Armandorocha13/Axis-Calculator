import { Logo } from "@/components/layout/logo";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Logo />
        </div>
        <Card className="shadow-md border-border/80 bg-card/95">
          <CardContent className="py-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
