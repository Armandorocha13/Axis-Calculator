"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MonthFilter } from "@/components/cash-flow/month-filter";
import { CashFlowModal } from "@/components/cash-flow/cash-flow-modal";
import type { CashFlowTypeValue } from "@/lib/validations/cash-flow";

export function CashFlowHeader({ currentMonthStr }: { currentMonthStr: string }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: CashFlowTypeValue;
  }>({
    isOpen: false,
    type: "entrada",
  });

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Fluxo de Caixa</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Controle de entradas, saídas e movimentações financeiras
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MonthFilter currentMonthStr={currentMonthStr} />

          <Button
            type="button"
            onClick={() => setModalState({ isOpen: true, type: "entrada" })}
            className="bg-[#4E6E49] text-white hover:bg-[#3F5B3B] border-transparent shadow-xs"
          >
            + Nova Entrada
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setModalState({ isOpen: true, type: "saida" })}
            className="border-rosa/60 text-rosa-foreground hover:bg-rosa-bg shadow-xs"
          >
            + Nova Saída
          </Button>
        </div>
      </div>

      <CashFlowModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        defaultType={modalState.type}
      />
    </>
  );
}
