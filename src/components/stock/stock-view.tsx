"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StockTable } from "./stock-table";
import { StockFormModal } from "./stock-form-modal";
import { StockEntryModal } from "./stock-entry-modal";
import { StockExitModal } from "./stock-exit-modal";
import { formatCurrencyBRL } from "@/lib/utils";
import type { StockItem } from "@/lib/types/database.types";
import { deleteStockItemAction } from "@/lib/stock/actions";

interface StockViewProps {
  initialItems: StockItem[];
}

const LOCAL_STORAGE_KEY = "arte_em_conta_stock_items_cache_v1";

export function StockView({ initialItems }: StockViewProps) {
  const [items, setItems] = useState<StockItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "available">("all");

  // Estados dos modais
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryItem, setEntryItem] = useState<StockItem | null>(null);

  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [exitItem, setExitItem] = useState<StockItem | null>(null);

  // Sincronização com localStorage para resiliência imediata
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StockItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Mescla itens locais com itens vindos do banco evitando duplicatas
          setItems((prev) => {
            if (prev.length === 0) return parsed;
            const map = new Map<string, StockItem>();
            parsed.forEach((it) => map.set(it.id, it));
            prev.forEach((it) => map.set(it.id, it));
            return Array.from(map.values());
          });
        }
      }
    } catch {
      // Ignora erro de parsing
    }
  }, []);

  const saveToLocal = (newItems: StockItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // Ignora falhas de cota
    }
  };

  // Itens filtrados por busca e status
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.unit.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      const currentQty = Number(item.current_quantity) || 0;
      const minQty = Number(item.min_quantity) || 0;
      const isLow = currentQty <= minQty && minQty > 0;

      if (filter === "low") return isLow;
      if (filter === "available") return !isLow && currentQty > 0;
      return true;
    });
  }, [items, search, filter]);

  // Indicadores de resumo
  const totalItems = items.length;
  const lowStockCount = useMemo(() => {
    return items.filter((it) => {
      const qty = Number(it.current_quantity) || 0;
      const min = Number(it.min_quantity) || 0;
      return qty <= min && min > 0;
    }).length;
  }, [items]);

  const totalStockValue = useMemo(() => {
    return items.reduce((acc, it) => {
      const qty = Number(it.current_quantity) || 0;
      const cost = Number(it.unit_cost) || 0;
      return acc + qty * cost;
    }, 0);
  }, [items]);

  // Handlers para o FormModal (Criar / Editar)
  const handleItemSaved = (savedItem: StockItem) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.id === savedItem.id);
      const updated = exists
        ? prev.map((it) => (it.id === savedItem.id ? savedItem : it))
        : [savedItem, ...prev];
      saveToLocal(updated);
      return updated;
    });
  };

  // Handlers para Entrada e Saída
  const handleUpdateItem = (updatedItem: StockItem) => {
    setItems((prev) => {
      const updated = prev.map((it) => (it.id === updatedItem.id ? updatedItem : it));
      saveToLocal(updated);
      return updated;
    });
  };

  // Handler de Exclusão
  const handleDeleteItem = async (item: StockItem) => {
    const confirmDelete = window.confirm(
      `Deseja realmente excluir o material "${item.name}" do estoque?`,
    );
    if (!confirmDelete) return;

    // Atualização otimista
    const updated = items.filter((it) => it.id !== item.id);
    saveToLocal(updated);

    if (!item.id.startsWith("local-")) {
      const formData = new FormData();
      formData.append("id", item.id);
      await deleteStockItemAction({}, formData);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Topo da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Controle de Estoque
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerencie materiais, registre compras, baixas e consulte o custo unitário automático para precificar.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setFormModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Cadastrar Material
        </Button>
      </div>

      {/* Indicadores Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Total de Itens */}
        <Card className="rounded-2xl border border-border bg-card shadow-[0_2px_12px_rgba(69,64,82,0.04)]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total de Materiais
              </span>
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
              {totalItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens ativos cadastrados no ateliê
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Estoque Baixo / Alerta */}
        <Card
          className={`rounded-2xl border shadow-[0_2px_12px_rgba(69,64,82,0.04)] transition-colors ${
            lowStockCount > 0
              ? "border-rosa/60 bg-[#FFFDFE]"
              : "border-border bg-card"
          }`}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alerta de Reposição
              </span>
              <span
                className={`p-2 rounded-xl ${
                  lowStockCount > 0
                    ? "bg-rosa-bg text-rosa-foreground"
                    : "bg-salvia-bg text-salvia-foreground"
                }`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
            </div>
            <div
              className={`mt-2 text-2xl sm:text-3xl font-bold ${
                lowStockCount > 0 ? "text-accent" : "text-foreground"
              }`}
            >
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lowStockCount > 0
                ? "Materiais no limite mínimo de estoque"
                : "Todos os itens com estoque em dia"}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Valor Total Investido em Estoque */}
        <Card className="rounded-2xl border border-border bg-card shadow-[0_2px_12px_rgba(69,64,82,0.04)]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valor Total em Estoque
              </span>
              <span className="p-2 rounded-xl bg-salvia-bg text-salvia-foreground">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
              {formatCurrencyBRL(totalStockValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Capital imobilizado em materiais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Busca e Filtros de Status */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar material por nome, unidade ou observação..."
            className="pl-9"
          />
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-3 text-muted-foreground pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Filtros de Status */}
        <div className="inline-flex items-center p-1 rounded-xl bg-muted/50 border border-border/70 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === "all"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("low")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === "low"
                ? "bg-card text-accent font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Estoque Baixo ({lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("available")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === "available"
                ? "bg-card text-salvia-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Disponível ({items.length - lowStockCount})
          </button>
        </div>
      </div>

      {/* Tabela e Lista Responsiva */}
      <StockTable
        items={filteredItems}
        onOpenEntry={(item) => {
          setEntryItem(item);
          setEntryModalOpen(true);
        }}
        onOpenExit={(item) => {
          setExitItem(item);
          setExitModalOpen(true);
        }}
        onOpenEdit={(item) => {
          setEditingItem(item);
          setFormModalOpen(true);
        }}
        onDelete={handleDeleteItem}
      />

      {/* Modais */}
      {formModalOpen && (
        <StockFormModal
          isOpen={formModalOpen}
          item={editingItem}
          onClose={() => {
            setFormModalOpen(false);
            setEditingItem(null);
          }}
          onSaved={handleItemSaved}
        />
      )}

      {entryModalOpen && entryItem && (
        <StockEntryModal
          isOpen={entryModalOpen}
          item={entryItem}
          onClose={() => {
            setEntryModalOpen(false);
            setEntryItem(null);
          }}
          onSuccess={handleUpdateItem}
        />
      )}

      {exitModalOpen && exitItem && (
        <StockExitModal
          isOpen={exitModalOpen}
          item={exitItem}
          onClose={() => {
            setExitModalOpen(false);
            setExitItem(null);
          }}
          onSuccess={handleUpdateItem}
        />
      )}
    </div>
  );
}
