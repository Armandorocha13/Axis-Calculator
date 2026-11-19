"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth/actions";
import { useAtelierSettings } from "@/components/settings/atelier-settings-context";
import type { Profile } from "@/lib/types/database.types";

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const baseNavItems: NavItem[] = [
  {
    href: "/visao-geral",
    label: "Visão Geral",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/meus-registros",
    label: "Meus Registros",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="7" x2="16" y2="7" />
        <line x1="9" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    href: "/pedidos",
    label: "Pedidos",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: "/clientes",
    label: "Clientes",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/calcular-preco",
    label: "Calcular Preço",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <path d="M16 14v4M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    href: "/fluxo-de-caixa",
    label: "Fluxo de Caixa",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <path d="M6 15h2M12 15h6" />
      </svg>
    ),
  },
];

const adminNavItem: NavItem = {
  href: "/admin/usuarios",
  label: "Admin",
  icon: () => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const SUGGESTION_WHATSAPP_URL =
  "https://wa.me/5521971809007?text=Oi%21%20Estou%20usando%20o%20Arte%20em%20Conta%20e%20tenho%20uma%20sugest%C3%A3o%20de%20melhoria%3A%20";

export function SidebarNav({
  isAdmin,
  profile,
  onNavigate,
}: {
  isAdmin: boolean;
  profile?: Profile | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { openSettings } = useAtelierSettings();

  const navItems = isAdmin
    ? [...baseNavItems, adminNavItem]
    : baseNavItems;

  return (
    <div className="flex flex-col justify-between h-full gap-6">
        {/* Bloco Superior: Navegação e Configurar Ateliê */}
        <div className="flex flex-col gap-1.5">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all group",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(155,135,199,0.28)] font-semibold"
                      : "text-foreground/80 hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {item.icon(active)}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divisor suave e Ação de Configurar Ateliê integrada ao menu */}
          <div className="pt-2 mt-1 border-t border-border/70">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSettings();
                onNavigate?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-all group text-left cursor-pointer select-none"
            >
              <span className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <span>Configurar Ateliê</span>
            </button>
          </div>
        </div>

        {/* Bloco Inferior: Sugerir Melhoria e Botão Sair com respiro visual */}
        <div className="pt-4 mt-auto border-t border-border flex flex-col gap-2">
          {/* Canal de Sugestões / WhatsApp */}
          <a
            href={SUGGESTION_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all group"
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
              className="shrink-0 text-salvia-foreground opacity-80 group-hover:opacity-100 transition-opacity"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>Sugerir melhoria</span>
          </a>

          {/* Botão Sair com separação para evitar cliques acidentais */}
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              onClick={onNavigate}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-rosa-bg/70 hover:text-rosa-foreground hover:border-rosa/40 border border-transparent transition-all group text-left"
              title="Encerrar sessão"
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
                className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sair da conta</span>
            </button>
          </form>
        </div>
      </div>
  );
}
