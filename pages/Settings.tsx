
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { UserSettings } from '../types';
import { Save, Building, Mail, Phone, MapPin, Percent, FileText } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure your business profile and quote defaults.</p>
        </div>
        <button 
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
        >
          <Save size={20} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Building className="text-blue-500" size={20} />
            Company Profile
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Business Name</label>
              <div className="relative">
                <input 
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full p-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Building className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Billing Email</label>
              <div className="relative">
                <input 
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                  className="w-full p-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <div className="relative">
                <input 
                  type="text"
                  value={settings.companyPhone}
                  onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                  className="w-full p-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Physical Address</label>
              <div className="relative">
                <textarea 
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  className="w-full p-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Percent className="text-blue-500" size={20} />
              Quote Defaults
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Default Tax Label</label>
                <input 
                  type="text"
                  value={settings.defaultTaxLabel}
                  onChange={(e) => setSettings({ ...settings, defaultTaxLabel: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tax Rate (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={settings.defaultTaxRate}
                  onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} />
              PDF Standard Terms
            </h2>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Default Terms & Conditions</label>
              <textarea 
                value={settings.defaultTerms}
                onChange={(e) => setSettings({ ...settings, defaultTerms: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-48 text-sm"
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default Settings;
