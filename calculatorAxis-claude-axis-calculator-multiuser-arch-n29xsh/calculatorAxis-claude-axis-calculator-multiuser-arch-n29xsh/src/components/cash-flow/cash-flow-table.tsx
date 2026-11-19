"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CashFlowModal } from "@/components/cash-flow/cash-flow-modal";
import { deleteCashFlowAction } from "@/app/(app)/fluxo-de-caixa/actions";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { CashFlowEntry } from "@/lib/types/database.types";

export function CashFlowTable({ entries }: { entries: CashFlowEntry[] }) {
  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma movimentação registrada para este mês.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Data</TableTh>
              <TableTh>Motivo</TableTh>
              <TableTh>Tipo</TableTh>
              <TableTh>Valor</TableTh>
              <TableTh className="text-right">Ações</TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((item) => {
              const isEntrada = item.type === "entrada";
              const motivoTexto = item.description || item.category;

              return (
                <TableRow key={item.id}>
                  <TableTd className="whitespace-nowrap font-medium text-xs sm:text-sm">
                    {formatDateBR(item.entry_date)}
                  </TableTd>
                  <TableTd>
                    <span className="font-medium">{motivoTexto}</span>
                    {item.order_id && (
                      <span className="ml-2 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Automático
                      </span>
                    )}
                  </TableTd>
                  <TableTd className="whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        isEntrada
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                      }`}
                    >
                      {isEntrada ? "Entrada" : "Saída"}
                    </span>
                  </TableTd>
                  <TableTd className="whitespace-nowrap font-semibold">
                    <span
                      className={
                        isEntrada
                          ? "text-emerald-600 dark:text-emerald-500"
                          : "text-red-600 dark:text-red-500"
                      }
                    >
                      {isEntrada ? "+" : "-"} {formatCurrencyBRL(Number(item.amount))}
                    </span>
                  </TableTd>
                  <TableTd className="whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingEntry(item)}
                        className="h-8 px-2.5 text-xs"
                      >
                        Editar
                      </Button>
                      <form
                        action={async () => {
                          if (
                            confirm(
                              "Tem certeza que deseja excluir esta movimentação?",
                            )
                          ) {
                            await deleteCashFlowAction(item.id);
                          }
                        }}
                      >
                        <Button
                          type="submit"
                          variant="destructive"
                          className="h-8 px-2.5 text-xs"
                        >
                          Excluir
                        </Button>
                      </form>
                    </div>
                  </TableTd>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editingEntry && (
        <CashFlowModal
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          editingEntry={editingEntry}
        />
      )}
    </>
  );
}
