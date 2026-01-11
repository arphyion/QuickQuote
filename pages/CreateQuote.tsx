
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { pdfService } from '../services/pdfService';
import { 
  Quote, 
  LineItem, 
  DiscountType, 
  QuoteStatus, 
  Product,
  QuoteTemplate
} from '../types';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileDown, 
  ArrowLeft,
  ChevronDown,
  Search,
  Settings as SettingsIcon,
  Copy
} from 'lucide-react';

const CreateQuote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const settings = storageService.getSettings();
  const allProducts = storageService.getProducts();
  const allTemplates = storageService.getTemplates();

  const [quote, setQuote] = useState<Quote>({
    id: crypto.randomUUID(),
    number: `Q-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(storageService.getQuotes().length + 1).toString().padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer: { name: '', email: '', company: '', phone: '', address: '' },
    salesRep: 'John Doe',
    items: [],
    globalDiscountType: DiscountType.PERCENTAGE,
    globalDiscountValue: 0,
    taxRate: settings.defaultTaxRate,
    taxLabel: settings.defaultTaxLabel,
    taxEnabled: true,
    status: QuoteStatus.DRAFT,
    terms: settings.defaultTerms,
    internalNotes: '',
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);

  // Effect to load existing quote if editing
  useEffect(() => {
    if (id) {
      const existing = storageService.getQuotes().find(q => q.id === id);
      if (existing) setQuote(existing);
    } else if (location.state && location.state.template) {
      // If we are creating a new quote and a template was passed via navigation
      const template = location.state.template as QuoteTemplate;
      handleLoadTemplate(template);
      // Clear the state to prevent reloading on refresh/back
      window.history.replaceState({}, document.title);
    }
  }, [id, location.state]);

  // Calculations
  const calculations = useMemo(() => {
    const lineItemTotals = quote.items.map(item => {
      const itemSubtotal = item.price * item.quantity;
      const discount = item.discountType === DiscountType.PERCENTAGE 
        ? (itemSubtotal * item.discountValue / 100) 
        : item.discountValue;
      return itemSubtotal - discount;
    });

    const subtotal = lineItemTotals.reduce((a, b) => a + b, 0);
    const globalDiscount = quote.globalDiscountType === DiscountType.PERCENTAGE
      ? (subtotal * quote.globalDiscountValue / 100)
      : quote.globalDiscountValue;
    
    const taxableAmount = subtotal - globalDiscount;
    const taxAmount = quote.taxEnabled ? (taxableAmount * quote.taxRate / 100) : 0;
    const grandTotal = taxableAmount + taxAmount;

    return {
      subtotal,
      discountAmount: globalDiscount,
      taxAmount,
      grandTotal
    };
  }, [quote.items, quote.globalDiscountType, quote.globalDiscountValue, quote.taxRate, quote.taxEnabled]);

  // Update quote with calculations whenever they change
  useEffect(() => {
    setQuote(prev => ({
      ...prev,
      ...calculations
    }));
  }, [calculations]);

  const handleAddItem = (product: Product) => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: 1,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 0
    };
    setQuote(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setShowProductModal(false);
  };

  const handleAddCustomItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      name: 'Custom Service',
      price: 0,
      quantity: 1,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 0
    };
    setQuote(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (itemId: string, updates: Partial<LineItem>) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
    }));
  };

  const removeItem = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleSave = () => {
    if (!quote.customer.name || !quote.customer.email) {
      alert('Please enter customer name and email.');
      return;
    }
    storageService.saveQuote(quote);
    alert('Quote saved successfully!');
    navigate('/quotes');
  };

  const handleDownload = () => {
    pdfService.generateQuotePDF(quote, settings);
  };

  const handleSaveAsTemplate = () => {
    const name = prompt('Enter template name:');
    if (!name) return;
    const template: QuoteTemplate = {
      id: crypto.randomUUID(),
      name,
      description: `Template based on quote ${quote.number}`,
      items: quote.items.map(it => ({ ...it, id: crypto.randomUUID() }))
    };
    storageService.saveTemplate(template);
    alert('Template saved!');
  };

  const handleLoadTemplate = (template: QuoteTemplate) => {
    setQuote(prev => ({
      ...prev,
      items: template.items.map(it => ({ ...it, id: crypto.randomUUID() }))
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/quotes')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit' : 'Create'} Quote</h1>
            <p className="text-sm text-gray-500">{quote.number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSaveAsTemplate}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50"
          >
            <Copy size={18} /> Save Template
          </button>
          <button 
            onClick={handleDownload}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50"
          >
            <FileDown size={18} /> Download
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 shadow-md"
          >
            <Save size={18} /> Save Quote
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Details */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
              Customer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Customer Name *</label>
                <input 
                  type="text" 
                  value={quote.customer.name}
                  onChange={(e) => setQuote({ ...quote, customer: { ...quote.customer, name: e.target.value } })}
                  placeholder="e.g. Jane Doe"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email *</label>
                <input 
                  type="email" 
                  value={quote.customer.email}
                  onChange={(e) => setQuote({ ...quote, customer: { ...quote.customer, email: e.target.value } })}
                  placeholder="jane@example.com"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Company (Optional)</label>
                <input 
                  type="text" 
                  value={quote.customer.company || ''}
                  onChange={(e) => setQuote({ ...quote, customer: { ...quote.customer, company: e.target.value } })}
                  placeholder="Acme Corp"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                <textarea 
                  value={quote.customer.address || ''}
                  onChange={(e) => setQuote({ ...quote, customer: { ...quote.customer, address: e.target.value } })}
                  placeholder="Full billing address..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-[6.5rem]"
                />
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                Line Items
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowProductModal(true)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-100"
                >
                  <Search size={16} /> Catalog
                </button>
                <button 
                  onClick={handleAddCustomItem}
                  className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-100"
                >
                  <Plus size={16} /> Custom
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {quote.items.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p>No items added yet. Use the catalog to add products.</p>
                </div>
              ) : (
                quote.items.map((item, idx) => (
                  <div key={item.id} className="p-6 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-[2] space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Item Name</label>
                            <input 
                              type="text" 
                              value={item.name}
                              onChange={(e) => updateItem(item.id, { name: e.target.value })}
                              className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                            <input 
                              type="number" 
                              value={item.quantity}
                              min="1"
                              onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                              className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                            <input 
                              type="number" 
                              value={item.price}
                              onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                              className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Description (Optional)</label>
                          <textarea 
                            value={item.description || ''}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:border-blue-500 h-16"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-between py-1">
                        <div className="font-bold text-gray-900 text-lg">
                          ${((item.price * item.quantity)).toFixed(2)}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Additional Settings */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Additional Terms & Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Terms & Conditions</label>
                <textarea 
                  value={quote.terms}
                  onChange={(e) => setQuote({ ...quote, terms: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Internal Notes (Hidden from PDF)</label>
                <textarea 
                  value={quote.internalNotes}
                  onChange={(e) => setQuote({ ...quote, internalNotes: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-32 text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-6">Quote Summary</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${quote.subtotal.toFixed(2)}</span>
              </div>

              {/* Discount Section */}
              <div className="space-y-2 pt-2 border-t border-gray-50">
                <div className="flex items-center justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Discount</span>
                    <select 
                      value={quote.globalDiscountType}
                      onChange={(e) => setQuote({ ...quote, globalDiscountType: e.target.value as DiscountType })}
                      className="text-[10px] bg-gray-100 px-1 rounded font-bold"
                    >
                      <option value={DiscountType.PERCENTAGE}>%</option>
                      <option value={DiscountType.FIXED}>$</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={quote.globalDiscountValue}
                      onChange={(e) => setQuote({ ...quote, globalDiscountValue: Number(e.target.value) })}
                      className="w-16 text-right font-semibold text-gray-900 bg-gray-50 border rounded px-1 outline-none"
                    />
                  </div>
                </div>
                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Total Discount</span>
                    <span>-${quote.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Tax Section */}
              <div className="space-y-2 pt-2 border-t border-gray-50">
                <div className="flex items-center justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Tax ({quote.taxLabel})</span>
                    <input 
                      type="checkbox" 
                      checked={quote.taxEnabled}
                      onChange={(e) => setQuote({ ...quote, taxEnabled: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={quote.taxRate}
                      disabled={!quote.taxEnabled}
                      onChange={(e) => setQuote({ ...quote, taxRate: Number(e.target.value) })}
                      className="w-12 text-right font-semibold text-gray-900 bg-gray-50 border rounded px-1 outline-none disabled:opacity-30"
                    />
                    <span>%</span>
                  </div>
                </div>
                {quote.taxEnabled && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax Amount</span>
                    <span className="font-semibold text-gray-900">${quote.taxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-lg font-bold text-gray-900">Grand Total</span>
                <span className="text-2xl font-black text-blue-600">${quote.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Quote Status</label>
                <select 
                  value={quote.status}
                  onChange={(e) => setQuote({ ...quote, status: e.target.value as QuoteStatus })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded font-semibold text-sm outline-none"
                >
                  {Object.values(QuoteStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Valid Until</label>
                <input 
                  type="date"
                  value={quote.validUntil}
                  onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded font-semibold text-sm outline-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Copy size={18} className="text-gray-400" /> Use Template
            </h2>
            <div className="space-y-2">
              {allTemplates.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No templates saved.</p>
              ) : (
                allTemplates.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => handleLoadTemplate(t)}
                    className="w-full text-left p-2 rounded text-sm hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all flex items-center justify-between"
                  >
                    <span>{t.name}</span>
                    <span className="text-[10px] text-gray-400">{t.items.length} items</span>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Catalog Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900">Product Catalog</h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-gray-200 rounded">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {allProducts.filter(p => p.active && p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku} • {product.category}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${product.price.toFixed(2)}</p>
                    <button 
                      onClick={() => handleAddItem(product)}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700"
                    >
                      Add to Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuote;
