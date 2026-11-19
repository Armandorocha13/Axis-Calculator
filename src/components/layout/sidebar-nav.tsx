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
  "https://wa.me/5521971809007?text=Oi%21%20Estou%20usando%20o%20Arte%20em%20Conta%20e%20tenho%20uma%20sugest%C3%A3o%20de%20melhoria%3A%20";

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
                "rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(155,135,199,0.28)] font-semibold"
                  : "text-foreground/80 hover:bg-muted/70 hover:text-foreground",
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
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-salvia-foreground opacity-80"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>Sugerir melhoria</span>
        </a>
      </div>
    </div>
  );
}
