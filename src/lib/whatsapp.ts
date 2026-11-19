import { formatCurrencyBRL } from "@/lib/utils";

/**
 * Modelo padrão inicial da mensagem de WhatsApp.
 * Suporta variáveis dinâmicas no formato {variavel}.
 */
export const DEFAULT_WHATSAPP_TEMPLATE = `Olá, {cliente}! Tudo bem?
Passando para avisar que o seu pedido ({pedido}) já está pronto para retirada!

Endereço: {endereco}
Horário de retirada: {horario}
{pagamento}

Qualquer dúvida é só me chamar por aqui!`;

export const WHATSAPP_TEMPLATE_VARIABLES: {
  tag: string;
  label: string;
  description: string;
  example: string;
}[] = [
  {
    tag: "{cliente}",
    label: "Nome do Cliente",
    description: "Nome completo do cliente cadastrado",
    example: "Mariana Souza",
  },
  {
    tag: "{pedido}",
    label: "Nome / Descrição do Pedido",
    description: "Descrição dos itens ou do produto",
    example: "Kit Festa Personalizado Circo Rosa",
  },
  {
    tag: "{endereco}",
    label: "Endereço de Retirada",
    description: "Endereço configurado nas opções do ateliê",
    example: "Rua das Flores, 123 - Centro",
  },
  {
    tag: "{horario}",
    label: "Horário de Retirada",
    description: "Horários de funcionamento / retirada",
    example: "Seg a Sex das 09h às 18h",
  },
  {
    tag: "{pagamento}",
    label: "Linha de Pagamento",
    description: "Aviso de pedido quitado ou valor restante + Pix",
    example: "Valor restante a pagar: R$ 45,00 (Chave Pix: 11987654321)",
  },
  {
    tag: "{saldo}",
    label: "Valor Restante",
    description: "Apenas o valor numérico em reais do saldo pendente",
    example: "R$ 45,00",
  },
  {
    tag: "{chave_pix}",
    label: "Chave Pix",
    description: "Chave Pix configurada no ateliê",
    example: "11987654321",
  },
  {
    tag: "{atelie}",
    label: "Nome do Ateliê",
    description: "Nome do seu ateliê ou marca",
    example: "Arte em Conta",
  },
];

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

export interface RenderWhatsAppParams {
  customerName: string;
  orderDescription: string;
  pickupAddress?: string | null;
  pickupHours?: string | null;
  pixKey?: string | null;
  remainingAmount?: number | null;
  businessName?: string | null;
}

export interface ReadyForPickupParams extends RenderWhatsAppParams {
  remainingAmount: number;
  template?: string | null;
}

/**
 * Renderiza uma mensagem do WhatsApp substituindo variáveis dinâmicas.
 */
export function renderWhatsAppMessage(
  template: string | null | undefined,
  params: RenderWhatsAppParams,
): string {
  const baseTemplate = template?.trim() ? template : DEFAULT_WHATSAPP_TEMPLATE;

  const address =
    params.pickupAddress?.trim() || "Consulte nosso endereço para retirada";
  const hours = params.pickupHours?.trim() || "A combinar";
  const remaining = params.remainingAmount ?? 0;
  const pix = params.pixKey?.trim()
    ? ` (Chave Pix: ${params.pixKey.trim()})`
    : "";

  let paymentLine = "";
  if (remaining <= 0) {
    paymentLine = "Pagamento: Pedido 100% quitado!";
  } else {
    paymentLine = `Valor restante a pagar: ${formatCurrencyBRL(
      remaining,
    )}${pix}`;
  }

  const saldo = remaining <= 0 ? "R$ 0,00" : formatCurrencyBRL(remaining);
  const atelie = params.businessName?.trim() || "Arte em Conta";
  const pixKeyOnly = params.pixKey?.trim() || "";

  return baseTemplate
    .replace(/\{cliente\}|\{nome_cliente\}/gi, params.customerName || "Cliente")
    .replace(/\{pedido\}|\{nome_pedido\}/gi, params.orderDescription || "seu pedido")
    .replace(/\{endereco\}/gi, address)
    .replace(/\{horario\}/gi, hours)
    .replace(/\{pagamento\}/gi, paymentLine)
    .replace(/\{saldo\}|\{valor_restante\}/gi, saldo)
    .replace(/\{chave_pix\}/gi, pixKeyOnly)
    .replace(/\{atelie\}|\{nome_atelie\}/gi, atelie);
}

/**
 * Compatibilidade legada com a função formatReadyForPickupMessage.
 */
export function formatReadyForPickupMessage(
  params: ReadyForPickupParams,
): string {
  return renderWhatsAppMessage(params.template, params);
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
