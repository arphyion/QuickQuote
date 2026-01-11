
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Quote, QuoteStatus } from '../types';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Copy, 
  ChevronDown,
  Eye
} from 'lucide-react';
import { pdfService } from '../services/pdfService';

const Quotes = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [settings] = useState(storageService.getSettings());

  useEffect(() => {
    setQuotes(storageService.getQuotes());
  }, []);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      storageService.deleteQuote(id);
      setQuotes(storageService.getQuotes());
    }
  };

  const handleDuplicate = (quote: Quote) => {
    const newQuote: Quote = {
      ...quote,
      id: crypto.randomUUID(),
      number: `Q-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(quotes.length + 1).toString().padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: QuoteStatus.DRAFT
    };
    storageService.saveQuote(newQuote);
    setQuotes(storageService.getQuotes());
    navigate(`/edit/${newQuote.id}`);
  };

  const handleDownload = (quote: Quote) => {
    pdfService.generateQuotePDF(quote, settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-500">Manage and track all customer quotations.</p>
        </div>
        <Link 
          to="/create" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Create Quote
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by customer or quote #"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm"
              >
                <option value="All">All Statuses</option>
                {Object.values(QuoteStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Quote #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No quotes matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{quote.number}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{quote.customer.name}</div>
                      <div className="text-xs text-gray-500">{quote.customer.company || 'Individual'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(quote.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ${quote.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${
                        quote.status === QuoteStatus.ACCEPTED ? 'bg-green-100 text-green-700' :
                        quote.status === QuoteStatus.SENT ? 'bg-blue-100 text-blue-700' :
                        quote.status === QuoteStatus.REJECTED ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/edit/${quote.id}`)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View/Edit"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDownload(quote)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDuplicate(quote)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(quote.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Quotes;
