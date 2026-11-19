"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AtelierSettingsModal } from "@/components/settings/atelier-settings-modal";
import type { Profile } from "@/lib/types/database.types";

export function AtelierBanner({ profile }: { profile?: Profile | null }) {
  const [modalOpen, setModalOpen] = useState(false);

  // Se já preencheu os 3 campos, não precisa exibir banner de alerta
  const hasSettings =
    profile?.pickup_address && profile?.pickup_hours && profile?.pix_key;

  if (hasSettings) return null;

  return (
    <>
      <Card className="border-dashed border-primary/40 bg-[#FAF8FC]">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Configure os dados de retirada e Pix do seu ateliê
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cadastre seu endereço, horário e chave Pix para gerar avisos prontos
              de WhatsApp para seus clientes com um clique.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => setModalOpen(true)}
            className="shrink-0 text-xs sm:text-sm shadow-xs"
          >
            Configurar Ateliê
          </Button>
        </CardContent>
      </Card>

      <AtelierSettingsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
      />
    </>
  );
}
