
import { Product, Quote, QuoteTemplate, UserSettings } from '../types';
import { SAMPLE_PRODUCTS, DEFAULT_USER_SETTINGS } from '../constants';

const KEYS = {
  PRODUCTS: 'qq_products',
  QUOTES: 'qq_quotes',
  TEMPLATES: 'qq_templates',
  SETTINGS: 'qq_settings'
};

export const storageService = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    if (!data) {
      storageService.saveProducts(SAMPLE_PRODUCTS);
      return SAMPLE_PRODUCTS;
    }
    return JSON.parse(data);
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Quotes
  getQuotes: (): Quote[] => {
    const data = localStorage.getItem(KEYS.QUOTES);
    return data ? JSON.parse(data) : [];
  },
  saveQuote: (quote: Quote) => {
    const quotes = storageService.getQuotes();
    const index = quotes.findIndex(q => q.id === quote.id);
    if (index > -1) {
      quotes[index] = quote;
    } else {
      quotes.push(quote);
    }
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
  },
  deleteQuote: (id: string) => {
    const quotes = storageService.getQuotes().filter(q => q.id !== id);
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
  },

  // Templates
  getTemplates: (): QuoteTemplate[] => {
    const data = localStorage.getItem(KEYS.TEMPLATES);
    return data ? JSON.parse(data) : [];
  },
  saveTemplate: (template: QuoteTemplate) => {
    const templates = storageService.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index > -1) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },
  deleteTemplate: (id: string) => {
    const templates = storageService.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },

  // Settings
  getSettings: (): UserSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_USER_SETTINGS;
  },
  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};
