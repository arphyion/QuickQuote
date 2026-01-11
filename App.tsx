import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  Package, 
  Settings, 
  Copy, 
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard.tsx';
import Quotes from './pages/Quotes.tsx';
import CreateQuote from './pages/CreateQuote.tsx';
import Products from './pages/Products.tsx';
import SettingsPage from './pages/Settings.tsx';
import Templates from './pages/Templates.tsx';

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Navbar = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
  <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 md:px-6">
    <div className="flex items-center gap-4">
      <button onClick={onOpenSidebar} className="block md:hidden text-gray-600">
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <FileText className="text-white" size={20} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 hidden sm:block">QuickQuote</h1>
      </div>
    </div>
    
    <div className="flex items-center gap-3 md:gap-6">
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search quotes..." 
          className="h-10 w-64 lg:w-80 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none transition-all"
        />
      </div>
      <button className="text-gray-500 hover:text-gray-900">
        <Bell size={20} />
      </button>
      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
        JD
      </div>
    </div>
  </header>
);

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white p-4 shrink-0">
        <div className="space-y-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/create" icon={FilePlus} label="Create Quote" active={location.pathname === '/create'} />
          <SidebarItem to="/quotes" icon={FileText} label="Quotes" active={location.pathname === '/quotes'} />
          <SidebarItem to="/products" icon={Package} label="Products" active={location.pathname === '/products'} />
          <SidebarItem to="/templates" icon={Copy} label="Templates" active={location.pathname === '/templates'} />
          <SidebarItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
        </div>
        <div className="mt-auto pt-4 border-t">
          <button className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}>
          <aside 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-600" size={24} />
                <h1 className="text-xl font-bold">QuickQuote</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-1">
              <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
              <SidebarItem to="/create" icon={FilePlus} label="Create Quote" active={location.pathname === '/create'} />
              <SidebarItem to="/quotes" icon={FileText} label="Quotes" active={location.pathname === '/quotes'} />
              <SidebarItem to="/products" icon={Package} label="Products" active={location.pathname === '/products'} />
              <SidebarItem to="/templates" icon={Copy} label="Templates" active={location.pathname === '/templates'} />
              <SidebarItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/create" element={<CreateQuote />} />
            <Route path="/edit/:id" element={<CreateQuote />} />
            <Route path="/products" element={<Products />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;