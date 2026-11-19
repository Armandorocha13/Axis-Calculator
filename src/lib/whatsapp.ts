import { formatCurrencyBRL } from "@/lib/utils";

/**
 * Limpa o número de telefone para o formato internacional aceito pelo WhatsApp (wa.me).
 * Adiciona o código do Brasil (55) caso não esteja presente.
 */
export function cleanPhoneNumberBR(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  // Se já começar com 55 e tiver tamanho de DDD + número (12 ou 13 dígitos)
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  return `55${digits}`;
}

export interface ReadyForPickupParams {
  customerName: string;
  orderDescription: string;
  pickupAddress?: string | null;
  pickupHours?: string | null;
  pixKey?: string | null;
  remainingAmount: number;
}

export function formatReadyForPickupMessage({
  customerName,
  orderDescription,
  pickupAddress,
  pickupHours,
  pixKey,
  remainingAmount,
}: ReadyForPickupParams): string {
  const address =
    pickupAddress?.trim() || "Consulte nosso endereço para retirada";
  const hours =
    pickupHours?.trim() || "A combinar";
  const pix = pixKey?.trim() ? ` (Chave Pix: ${pixKey.trim()})` : "";

  let paymentLine = "";
  if (remainingAmount <= 0) {
    paymentLine = "Pagamento: Pedido 100% quitado!";
  } else {
    paymentLine = `Valor restante a pagar: ${formatCurrencyBRL(
      remainingAmount,
    )}${pix}`;
  }

  return `Olá, ${customerName}! Tudo bem?
Passando para avisar que o seu pedido (${orderDescription}) já está pronto para retirada!

Endereço: ${address}
Horário de retirada: ${hours}
${paymentLine}

Qualquer dúvida é só me chamar por aqui!`;
}

export function getWhatsAppUrl({
  phone,
  text,
}: {
  phone: string;
  text?: string;
}): string {
  const cleaned = cleanPhoneNumberBR(phone);
  if (!cleaned) return "#";
  const encoded = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${cleaned}${encoded}`;
}
