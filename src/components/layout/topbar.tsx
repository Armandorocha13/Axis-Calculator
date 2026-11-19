"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { Profile } from "@/lib/types/database.types";

export function Topbar({
  businessName,
  isAdmin,
  profile,
}: {
  businessName?: string | null;
  isAdmin: boolean;
  profile?: Profile | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
        {/* Lado Esquerdo: Menu mobile / Espaçador para alinhamento simétrico */}
        <div className="flex items-center justify-start flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="shrink-0 rounded-xl p-2 hover:bg-muted/70 md:hidden text-foreground transition-colors"
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Centro: Logo em Destaque Centralizada */}
        <div className="flex shrink-0 items-center justify-center">
          <Link
            href="/visao-geral"
            className="flex items-center justify-center transition-opacity hover:opacity-90 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 py-0.5"
            title="Arte em Conta — Início"
          >
            <Logo size="md" priority />
          </Link>
        </div>

        {/* Lado Direito: Identificação do Ateliê / Equilíbrio visual */}
        <div className="flex items-center justify-end flex-1 min-w-0">
          {businessName ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 sm:px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-salvia shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-[180px] md:max-w-[220px]">
                {businessName}
              </span>
            </span>
          ) : (
            <div className="w-8 md:w-0" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Menu Responsivo Suspenso em Telas Menores */}
      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-2xs md:hidden"
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-card p-4 shadow-xl md:hidden max-h-[85vh] overflow-y-auto">
            <SidebarNav
              isAdmin={isAdmin}
              profile={profile}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        </>
      )}
    </header>
  );
}
