
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { QuoteTemplate, LineItem, Product, DiscountType } from '../types';
import { Trash2, FileText, Search, Plus, ExternalLink, Edit2, Copy, X, Save, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const allProducts = storageService.getProducts();

  useEffect(() => {
    setTemplates(storageService.getTemplates());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      storageService.deleteTemplate(id);
      setTemplates(storageService.getTemplates());
    }
  };

  const handleClone = (template: QuoteTemplate) => {
    const cloned: QuoteTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      items: template.items.map(it => ({ ...it, id: crypto.randomUUID() }))
    };
    storageService.saveTemplate(cloned);
    setTemplates(storageService.getTemplates());
  };

  const handleUse = (template: QuoteTemplate) => {
    navigate('/create', { state: { template } });
  };

  const handleOpenCreate = () => {
    setEditingTemplate({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      items: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: QuoteTemplate) => {
    setEditingTemplate({ ...template });
    setIsModalOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate || !editingTemplate.name) {
      alert('Template name is required');
      return;
    }
    storageService.saveTemplate(editingTemplate);
    setTemplates(storageService.getTemplates());
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const addItemToTemplate = (product: Product) => {
    if (!editingTemplate) return;
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
    setEditingTemplate({
      ...editingTemplate,
      items: [...editingTemplate.items, newItem]
    });
    setShowProductModal(false);
  };

  const removeItemFromTemplate = (itemId: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      items: editingTemplate.items.filter(it => it.id !== itemId)
    });
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Templates</h1>
          <p className="text-gray-500">Manage your library of different project and service configurations.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          Create Template
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search templates by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">No templates found.</p>
            <p className="text-sm">Create templates for different types of clients or projects.</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleClone(template)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    title="Clone Template"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={() => handleOpenEdit(template)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Template"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    title="Delete Template"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-grow">{template.description || 'No description provided.'}</p>
              
              <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                <span className="text-xs font-bold text-gray-400 uppercase">{template.items.length} Items</span>
                <button 
                  onClick={() => handleUse(template)}
                  className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  Use Template <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Template Editor Modal */}
      {isModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTemplate.id === 'new' ? 'Create New Template' : 'Edit Template'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Template Name</label>
                  <input 
                    type="text" 
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                    placeholder="e.g., Enterprise Software Bundle"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Description</label>
                  <input 
                    type="text" 
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                    placeholder="Purpose of this template..."
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Package size={18} className="text-blue-500" />
                    Template Line Items
                  </h4>
                  <button 
                    onClick={() => setShowProductModal(true)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <Plus size={14} /> Add from Catalog
                  </button>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {editingTemplate.items.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic bg-gray-50/30">
                      No items in this template yet. Add products to get started.
                    </div>
                  ) : (
                    editingTemplate.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => removeItemFromTemplate(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTemplate}
                className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
              >
                <Save size={20} />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Search within Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add to Template</h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-3">
              <input 
                type="text" 
                placeholder="Search products..."
                autoFocus
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {allProducts.filter(p => p.active && p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                <button 
                  key={product.id}
                  onClick={() => addItemToTemplate(product)}
                  className="w-full p-4 text-left hover:bg-blue-50 flex justify-between items-center group transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                  </div>
                  <Plus size={16} className="text-blue-500 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
