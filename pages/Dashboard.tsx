import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService.ts';
import { Quote, QuoteStatus } from '../types.ts';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Package
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [productsCount, setProductsCount] = useState(0);

  useEffect(() => {
    setQuotes(storageService.getQuotes());
    setProductsCount(storageService.getProducts().length);
  }, []);

  const stats = {
    totalValue: quotes.reduce((acc, q) => acc + q.grandTotal, 0),
    activeQuotes: quotes.filter(q => q.status === QuoteStatus.SENT || q.status === QuoteStatus.DRAFT).length,
    acceptedValue: quotes.filter(q => q.status === QuoteStatus.ACCEPTED).reduce((acc, q) => acc + q.grandTotal, 0),
    avgQuote: quotes.length > 0 ? quotes.reduce((acc, q) => acc + q.grandTotal, 0) / quotes.length : 0
  };

  const recentQuotes = [...quotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, John! Here's what's happening with your quotes.</p>
        </div>
        <Link 
          to="/create" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          New Quote
        </Link>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pipeline" 
          value={`$${stats.totalValue.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-indigo-600" 
          trend={12}
        />
        <StatCard 
          title="Active Quotes" 
          value={stats.activeQuotes} 
          icon={FileText} 
          color="bg-blue-600" 
          trend={-5}
        />
        <StatCard 
          title="Accepted Value" 
          value={`$${stats.acceptedValue.toLocaleString()}`} 
          icon={CheckCircle} 
          color="bg-green-600" 
          trend={18}
        />
        <StatCard 
          title="Avg. Quote Size" 
          value={`$${stats.avgQuote.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={DollarSign} 
          color="bg-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quotes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Quotes</h2>
            <Link to="/quotes" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentQuotes.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No quotes found. Start by creating one!</p>
              </div>
            ) : (
              recentQuotes.map(quote => (
                <Link 
                  key={quote.id} 
                  to={`/edit/${quote.id}`} 
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{quote.customer.name}</p>
                      <p className="text-xs text-gray-500">{quote.number} • {new Date(quote.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${quote.grandTotal.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      quote.status === QuoteStatus.ACCEPTED ? 'bg-green-100 text-green-700' :
                      quote.status === QuoteStatus.SENT ? 'bg-blue-100 text-blue-700' :
                      quote.status === QuoteStatus.REJECTED ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Misc */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Catalog Overview</h2>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 mb-4">
              <Package className="text-gray-400" size={32} />
              <div>
                <p className="text-sm font-medium text-gray-500">Products in Catalog</p>
                <p className="text-xl font-bold text-gray-900">{productsCount}</p>
              </div>
            </div>
            <Link 
              to="/products" 
              className="block w-full text-center py-2 px-4 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
            >
              Manage Catalog
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={24} />
              <h2 className="font-bold">Next Follow-up</h2>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              You have 3 quotes expiring this week. Check them out to ensure conversion.
            </p>
            <button className="bg-white text-blue-700 w-full py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50">
              View Expiring Quotes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;