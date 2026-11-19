"use client";

import { useState } from "react";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { AtelierSettingsModal } from "@/components/settings/atelier-settings-modal";
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="relative border-b border-border bg-background">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="shrink-0 rounded-md p-2 hover:bg-muted md:hidden"
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
            <div className="flex min-w-0 flex-col">
              <Logo className="text-sm sm:text-lg" />
              {businessName && (
                <span className="truncate text-xs text-muted-foreground">
                  {businessName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSettingsOpen(true)}
              className="text-xs sm:text-sm px-2.5 sm:px-3 h-9"
            >
              Configurações do Ateliê
            </Button>
            <form action={signOutAction} className="shrink-0">
              <Button type="submit" variant="ghost" className="text-xs sm:text-sm h-9">
                Sair
              </Button>
            </form>
          </div>
        </div>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
            />
            <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-background p-4 shadow-md md:hidden">
              <SidebarNav isAdmin={isAdmin} onNavigate={() => setMenuOpen(false)} />
            </div>
          </>
        )}
      </header>

      <AtelierSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
      />
    </>
  );
}
