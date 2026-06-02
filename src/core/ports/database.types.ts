export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceGroup {
  id: string;
  name: string;
  items: InvoiceItem[];
}

export interface Invoice {
  id: string;
  userId: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string | null;
  amount: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'UNPAID';
  groups: InvoiceGroup[];
  
  // Snapshots from Profile at generation time
  currency?: string | null;
  currency_symbol?: string | null;
  signature_url?: string | null;
  signatory_name?: string | null;
  bank_name?: string | null;
  bank_account_holder?: string | null;
  bank_account_number?: string | null;
  bank_swift?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string; // typically matches auth uid
  
  // Basic Info
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_address: string | null;
  company_logo: string | null;
  
  // Business Info
  business_registration: string | null;
  tax_id: string | null;
  
  // Regional Settings
  default_currency: string;
  currency_symbol: string;
  
  // Contact Details
  email: string | null;
  phone: string | null;
  website: string | null;
  billing_address: string | null;
  
  // Bank Details
  bank_enabled: boolean;
  bank_name: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_swift: string | null;
  
  // Signature
  signature_enabled: boolean;
  signature_url: string | null;
  signatory_name: string | null;
  
  created_at: Date;
  updated_at: Date;
}
