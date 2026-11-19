"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cleanPhoneNumberBR, getWhatsAppUrl } from "@/lib/whatsapp";

interface WhatsAppPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  phone: string;
  initialMessage: string;
  title?: string;
}

export function WhatsAppPreviewModal({
  isOpen,
  onClose,
  customerName,
  phone,
  initialMessage,
  title = "Aviso do WhatsApp",
}: WhatsAppPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMessage(initialMessage);
    setCopied(false);
  }, [initialMessage, isOpen]);

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

  if (!isOpen || !mounted) return null;

  const cleanedPhone = cleanPhoneNumberBR(phone);
  const waUrl = getWhatsAppUrl({ phone, text: message });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  function handleSend() {
    if (!cleanedPhone) return;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop com blur suave */}
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
        className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho */}
        <div className="mb-4 flex items-start justify-between border-b border-border/80 pb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Destinatário: <span className="font-medium text-foreground">{customerName}</span> ({phone || "sem telefone"})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
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

        {/* Corpo: Editor da mensagem antes de enviar */}
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="whatsapp_preview_text">Mensagem a ser enviada</Label>
              <span className="text-[11px] text-muted-foreground">
                Você pode ajustar o texto antes de abrir o WhatsApp
              </span>
            </div>
            <textarea
              id="whatsapp_preview_text"
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/80 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCopy}
            className="text-xs sm:text-sm px-3 cursor-pointer"
          >
            {copied ? "✓ Mensagem copiada!" : "Copiar texto"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!cleanedPhone}
              className="bg-[#4E6E49] text-white hover:bg-[#3F5B3B] border-transparent shadow-xs text-xs sm:text-sm font-medium cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                className="fill-current mr-1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Abrir WhatsApp</span>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
