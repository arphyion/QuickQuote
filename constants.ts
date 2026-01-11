
import { Product, UserSettings } from './types';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  companyName: 'Acme Solutions Inc.',
  companyAddress: '123 Business Way, Suite 100\nInnovation City, ST 12345',
  companyEmail: 'billing@acmesolutions.com',
  companyPhone: '+1 (555) 000-0000',
  defaultTaxRate: 8.5,
  defaultTaxLabel: 'Sales Tax',
  defaultTerms: '1. Payment is due within 30 days of quote acceptance.\n2. All prices are valid for 30 days.\n3. Custom software services include a 1-year maintenance period.'
};

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Standard Laptop Pro',
    description: 'High performance laptop with 32GB RAM, 1TB SSD.',
    price: 1499.00,
    sku: 'HW-LP-001',
    category: 'Hardware',
    unit: 'unit',
    active: true
  },
  {
    id: '2',
    name: 'Cloud Hosting Monthly',
    description: 'Scalable cloud infrastructure hosting.',
    price: 49.99,
    sku: 'SW-CL-002',
    category: 'Software',
    unit: 'month',
    active: true
  },
  {
    id: '3',
    name: 'Professional Consulting',
    description: 'Hourly rate for expert IT consulting services.',
    price: 150.00,
    sku: 'SR-CS-003',
    category: 'Service',
    unit: 'hour',
    active: true
  }
];
