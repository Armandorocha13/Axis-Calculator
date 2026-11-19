"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { Profile } from "@/lib/types/database.types";

export function Topbar({
  isAdmin,
  profile,
}: {
  businessName?: string | null;
  isAdmin: boolean;
  profile?: Profile | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Permite fechar o menu mobile com a tecla ESC
  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Lado Esquerdo: Botão de Menu para Celulares/Tablets + Espaçador simétrico */}
        <div className="flex items-center justify-start flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="shrink-0 rounded-xl p-2 hover:bg-muted/70 md:hidden text-foreground transition-colors cursor-pointer"
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

        {/* Centro: Logo Arte em Conta em Destaque Centralizada */}
        <div className="flex shrink-0 items-center justify-center">
          <Link
            href="/visao-geral"
            className="flex items-center justify-center transition-opacity hover:opacity-90 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 py-0.5"
            title="Arte em Conta — Início"
          >
            <Logo size="md" priority />
          </Link>
        </div>

        {/* Lado Direito: Espaço vazio proporcional para manter a logo rigorosamente centralizada */}
        <div className="flex items-center justify-end flex-1 min-w-0 pointer-events-none" aria-hidden="true" />
      </div>

      {/* Menu Responsivo Suspenso em Telas Menores - Portaled para document.body para eliminar qualquer conflito de stacking context ou corte */}
      {menuOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 md:hidden flex flex-col">
          {/* Backdrop escuro com blur suave que fecha apenas ao clicar FORA do menu */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity animate-in fade-in"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Painel do Menu suspenso */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de Navegação"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex flex-col w-full max-h-[88vh] border-b border-border bg-card p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-top-3 duration-150"
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/70">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Navegação
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
                aria-label="Fechar menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <SidebarNav
              isAdmin={isAdmin}
              profile={profile}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
