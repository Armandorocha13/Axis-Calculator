"use client";

import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/lib/types/database.types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function CustomerAutocomplete({
  customers,
  defaultCustomerId,
}: {
  customers: Customer[];
  defaultCustomerId?: string | null;
}) {
  const defaultCustomer = customers.find((c) => c.id === defaultCustomerId);

  const [customerId, setCustomerId] = useState(defaultCustomerId ?? "");
  const [query, setQuery] = useState(defaultCustomer?.name ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const needle = normalize(query);
    return customers
      .filter((customer) => normalize(customer.name).includes(needle))
      .slice(0, 8);
  }, [customers, query]);

  function selectCustomer(customer: Customer) {
    setCustomerId(customer.id);
    setQuery(customer.name);
    setOpen(false);
  }

  function clearSelection() {
    setCustomerId("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor="customer_search">Cliente</Label>
      <input type="hidden" name="customer_id" value={customerId} />
      <div className="flex gap-2">
        <Input
          id="customer_search"
          autoComplete="off"
          placeholder="Digite pra buscar (opcional)"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCustomerId("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {(query || customerId) && (
          <button
            type="button"
            onClick={clearSelection}
            className="shrink-0 rounded-xl border border-border px-3 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {suggestions.map((customer) => (
            <li key={customer.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCustomer(customer)}
                className="block w-full px-3.5 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                {customer.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground shadow-lg">
          Nenhum cliente encontrado.
        </div>
      )}
    </div>
  );
}
