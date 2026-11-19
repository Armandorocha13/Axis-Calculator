import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
        {/* Logo completa com ícone de etiqueta em destaque */}
        <div className="mb-6 sm:mb-8 flex justify-center w-full">
          <Logo variant="full" size="lg" priority />
        </div>
        <Card className="w-full rounded-2xl border border-border bg-card shadow-[0_4px_20px_rgba(69,64,82,0.06)]">
          <CardContent className="p-6 sm:p-8">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
