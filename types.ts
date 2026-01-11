
export enum QuoteStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  EXPIRED = 'Expired'
}

export enum DiscountType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  unit: string;
  imageUrl?: string;
  active: boolean;
}

export interface LineItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discountType: DiscountType;
  discountValue: number;
  notes?: string;
}

export interface Customer {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Quote {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  customer: Customer;
  salesRep: string;
  items: LineItem[];
  globalDiscountType: DiscountType;
  globalDiscountValue: number;
  taxRate: number;
  taxLabel: string;
  taxEnabled: boolean;
  status: QuoteStatus;
  terms: string;
  internalNotes: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  items: LineItem[];
}

export interface UserSettings {
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  defaultTaxRate: number;
  defaultTaxLabel: string;
  defaultTerms: string;
}
