"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const baseItems = [
  { href: "/visao-geral", label: "Visão Geral" },
  { href: "/clientes", label: "Clientes" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/calcular-preco", label: "Calcular Preço" },
  { href: "/fluxo-de-caixa", label: "Fluxo de Caixa" },
];

const SUGGESTION_WHATSAPP_URL =
  "https://wa.me/5521971809007?text=Oi%21%20Estou%20usando%20o%20Axis%20Calculator%20e%20tenho%20uma%20sugest%C3%A3o%20de%20melhoria%3A%20";

export function SidebarNav({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...baseItems, { href: "/admin/usuarios", label: "Admin" }]
    : baseItems;

  return (
    <div className="flex flex-col justify-between h-full gap-6">
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Botão discreto Sugerir melhoria */}
      <div className="pt-3 border-t border-border">
        <a
          href={SUGGESTION_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 opacity-70"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>Sugerir melhoria</span>
        </a>
      </div>
    </div>
  );
}
