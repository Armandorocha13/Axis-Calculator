"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAtelierSettingsAction } from "@/lib/settings/actions";
import type { Profile } from "@/lib/types/database.types";
import {
  DEFAULT_WHATSAPP_TEMPLATE,
  WHATSAPP_TEMPLATE_VARIABLES,
  renderWhatsAppMessage,
} from "@/lib/whatsapp";

interface AtelierSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Profile | null;
}

export function AtelierSettingsModal({
  isOpen,
  onClose,
  profile,
}: AtelierSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [template, setTemplate] = useState(DEFAULT_WHATSAPP_TEMPLATE);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Inicializa o modelo a partir do profile salvo ou do localStorage ou do padrão
  useEffect(() => {
    if (!isOpen) return;

    if (profile?.whatsapp_template?.trim()) {
      setTemplate(profile.whatsapp_template);
    } else {
      const local = typeof window !== "undefined"
        ? localStorage.getItem("arte_em_conta_wa_template")
        : null;
      if (local?.trim()) {
        setTemplate(local);
      } else {
        setTemplate(DEFAULT_WHATSAPP_TEMPLATE);
      }
    }
    setError(null);
    setSuccess(false);
  }, [isOpen, profile?.whatsapp_template]);

  if (!isOpen || !mounted) return null;

  function handleInsertVariable(variableTag: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setTemplate((prev) => `${prev} ${variableTag}`);
      return;
    }

    const start = textarea.selectionStart ?? template.length;
    const end = textarea.selectionEnd ?? template.length;
    const newText =
      template.substring(0, start) + variableTag + template.substring(end);

    setTemplate(newText);

    // Reposiciona o cursor após a inserção
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variableTag.length,
        start + variableTag.length,
      );
    }, 10);
  }

  function handleResetDefault() {
    if (
      confirm("Deseja restaurar o modelo de mensagem padrão do Arte em Conta?")
    ) {
      setTemplate(DEFAULT_WHATSAPP_TEMPLATE);
      if (typeof window !== "undefined") {
        localStorage.removeItem("arte_em_conta_wa_template");
      }
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Garante que o template atualizado seja enviado
    formData.set("whatsapp_template", template);

    // Salva cópia local imediata
    if (typeof window !== "undefined") {
      localStorage.setItem("arte_em_conta_wa_template", template);
    }

    startTransition(async () => {
      const res = await saveAtelierSettingsAction({}, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 700);
      }
    });
  }

  // Amostra de preview com dados fictícios para visualização
  const previewSample = renderWhatsAppMessage(template, {
    customerName: "Camila Martins",
    orderDescription: "Caixa Cenário e Convites Luxo",
    pickupAddress: profile?.pickup_address || "Rua das Flores, 123 - Centro",
    pickupHours:
      profile?.pickup_hours || "Seg a Sex das 09h às 18h / Sáb até às 13h",
    pixKey: profile?.pix_key || "contato@arteemconta.com",
    remainingAmount: 45.0,
    businessName: profile?.business_name || "Arte em Conta",
  });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop transparente com blur suave que fecha ao clicar fora */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Card do Modal */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-2xl max-h-[92vh] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-card shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Configurações da Loja
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalize os dados de retirada e o modelo de mensagem do WhatsApp
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Formulário com rolagem */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-y-auto px-6 py-5 gap-6"
        >
          {/* Seção 1: Dados da Loja */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h3 className="text-sm font-semibold text-foreground">
                1. Informações de Retirada & Pagamento
              </h3>
              <p className="text-xs text-muted-foreground">
                Estes dados alimentam as variáveis automáticas da mensagem.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="business_name">Nome da Loja / Marca</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  defaultValue={profile?.business_name ?? ""}
                  placeholder="Ex: Minha Loja Criativa"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="pickup_address">Endereço de retirada</Label>
                <Input
                  id="pickup_address"
                  name="pickup_address"
                  defaultValue={profile?.pickup_address ?? ""}
                  placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pickup_hours">Horário de retirada</Label>
                <Input
                  id="pickup_hours"
                  name="pickup_hours"
                  defaultValue={profile?.pickup_hours ?? ""}
                  placeholder="Ex: Seg a Sex das 09h às 18h"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pix_key">Chave Pix</Label>
                <Input
                  id="pix_key"
                  name="pix_key"
                  defaultValue={profile?.pix_key ?? ""}
                  placeholder="Ex: 11987654321 ou email@atelie.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Modelo da Mensagem de WhatsApp */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  2. Modelo da Mensagem Automática do WhatsApp
                </h3>
                <p className="text-xs text-muted-foreground">
                  Edite o texto com o tom de voz da sua loja. As variáveis entre chaves são preenchidas na hora do envio.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetDefault}
                className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                title="Voltar ao texto padrão original"
              >
                Restaurar padrão
              </Button>
            </div>

            {/* Variáveis dinâmicas para clicar e inserir */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                Clique em uma variável abaixo para inseri-la no texto:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {WHATSAPP_TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertVariable(v.tag)}
                    title={`${v.description} (exemplo: ${v.example})`}
                    className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-foreground hover:bg-primary/20 hover:border-primary/50 transition-colors"
                  >
                    <span>{v.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor de texto */}
            <div>
              <textarea
                ref={textareaRef}
                id="whatsapp_template"
                name="whatsapp_template"
                rows={7}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground/70 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                placeholder="Escreva a mensagem personalizada..."
                required
              />
            </div>

            {/* Alternar Preview */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>{showPreview ? "Ocultar exemplo de visualização" : "Ver exemplo de como o cliente receberá"}</span>
              </button>
            </div>

            {showPreview && (
              <div className="rounded-xl border border-salvia/30 bg-[#F7F5F0] p-3.5 text-xs text-foreground/90 whitespace-pre-wrap font-sans shadow-xs">
                <div className="text-[10px] font-semibold text-salvia-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span>Exemplo simulado para um cliente:</span>
                </div>
                {previewSample}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-accent" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p
              className="text-sm text-salvia-foreground font-semibold"
              role="status"
            >
              ✓ Configurações e modelo de WhatsApp salvos com sucesso!
            </p>
          )}

          {/* Rodapé fixo dentro da área do form */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/80 pt-4 shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
