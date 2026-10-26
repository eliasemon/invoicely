export type DocumentType = 'invoice' | 'challan' | 'quotation';
export type DeliveryChannel = 'whatsapp' | 'email' | 'gmail';

export interface SendDocumentInput {
  documentId: string;
  documentType: DocumentType;
  channel: DeliveryChannel;
  recipient: string;
  subject?: string;
  message: string;
  quotationWithPricing?: boolean;
  idempotencyKey?: string;
}

export interface SendDocumentResult {
  success: boolean;
  channel: DeliveryChannel;
  recipient: string;
  deliveryHistoryId?: string;
  providerMessageId?: string;
  error?: string;
  errorCode?: string;
}

export interface TemplateVariables {
  customerName: string;
  documentNumber: string;
  companyName: string;
}

function resolveVars(
  varsOrName: TemplateVariables | string,
  docNumber?: string,
  company?: string
): TemplateVariables {
  if (typeof varsOrName === 'object' && varsOrName !== null) {
    return varsOrName;
  }
  return {
    customerName: varsOrName || 'Customer',
    documentNumber: docNumber || '',
    companyName: company || 'our company',
  };
}

export function getDefaultWhatsAppMessage(
  type: DocumentType,
  varsOrName: TemplateVariables | string,
  docNumber?: string,
  company?: string
): string {
  const vars = resolveVars(varsOrName, docNumber, company);
  const customer = vars.customerName || 'Customer';
  const docNum = vars.documentNumber || '';
  const comp = vars.companyName || 'our company';

  switch (type) {
    case 'invoice':
      return `Hello ${customer},\n\nPlease find attached Invoice #${docNum} from ${comp}.\n\nThank you for your business.`;
    case 'challan':
      return `Hello ${customer},\n\nPlease find attached Delivery Challan #${docNum} from ${comp}.\n\nThank you.`;
    case 'quotation':
      return `Hello ${customer},\n\nPlease find attached Quotation #${docNum} from ${comp}.\n\nPlease review it and contact us if you have any questions.\n\nThank you.`;
    default:
      return `Hello ${customer},\n\nPlease find attached #${docNum} from ${comp}.\n\nThank you.`;
  }
}

export function getDefaultEmailContent(
  type: DocumentType,
  varsOrName: TemplateVariables | string,
  docNumber?: string,
  company?: string
): { subject: string; body: string } {
  const vars = resolveVars(varsOrName, docNumber, company);
  const customer = vars.customerName || 'Customer';
  const docNum = vars.documentNumber || '';
  const comp = vars.companyName || 'our company';

  switch (type) {
    case 'invoice':
      return {
        subject: `Invoice #${docNum} - ${comp}`,
        body: `Dear ${customer},\n\nPlease find attached Invoice #${docNum} issued by ${comp}.\n\nThank you for your business.\n\nBest regards,\n${comp}`,
      };
    case 'challan':
      return {
        subject: `Delivery Challan #${docNum} - ${comp}`,
        body: `Dear ${customer},\n\nPlease find attached Delivery Challan #${docNum} for your reference.\n\nBest regards,\n${comp}`,
      };
    case 'quotation':
      return {
        subject: `Quotation #${docNum} - ${comp}`,
        body: `Dear ${customer},\n\nPlease find attached our Quotation #${docNum}.\n\nPlease review the quotation and contact us if you need any clarification.\n\nBest regards,\n${comp}`,
      };
    default:
      return {
        subject: `Document #${docNum} - ${comp}`,
        body: `Dear ${customer},\n\nPlease find attached document #${docNum}.\n\nBest regards,\n${comp}`,
      };
  }
}
