"use client";

import { useState } from "react";
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
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* Botão de Menu para Celulares/Tablets */}
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
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Logo Oficial e Nome do Ateliê */}
          <div className="flex min-w-0 items-center gap-3">
            <Logo size="md" priority />
            {businessName && (
              <span className="hidden sm:inline-block border-l border-border pl-3 text-xs font-medium text-muted-foreground truncate max-w-[220px]">
                {businessName}
              </span>
            )}
          </div>
        </div>

        {/* Lado Direito: sutil indicador do Ateliê quando em telas maiores */}
        {businessName && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-salvia" />
              <span className="truncate max-w-[180px]">{businessName}</span>
            </span>
          </div>
        )}
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
