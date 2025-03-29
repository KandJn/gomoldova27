import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Save, Lock, Bell, Globe, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Example settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    language: 'ro',
    autoApproveVerifiedCompanies: false,
    requirePhoneVerification: true,
    maxFailedLoginAttempts: 5,
    sessionTimeout: 60, // minutes
  });

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would save to your settings table
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Setările au fost salvate cu succes');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Setări Administrative</h1>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvează modificările
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Notifications Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium">Notificări</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Notificări email</label>
                <p className="text-sm text-gray-500">Primește notificări prin email pentru evenimente importante</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Notificări push</label>
                <p className="text-sm text-gray-500">Primește notificări push în browser pentru actualizări în timp real</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium">Securitate</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Verificare număr de telefon</label>
                <p className="text-sm text-gray-500">Solicită verificarea numărului de telefon pentru toți utilizatorii noi</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requirePhoneVerification}
                  onChange={(e) => setSettings({ ...settings, requirePhoneVerification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <label className="block font-medium text-gray-700">Încercări eșuate de autentificare</label>
              <p className="text-sm text-gray-500 mb-2">Numărul maxim de încercări eșuate înainte de blocare</p>
              <select
                value={settings.maxFailedLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxFailedLoginAttempts: Number(e.target.value) })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={3}>3 încercări</option>
                <option value={5}>5 încercări</option>
                <option value={10}>10 încercări</option>
              </select>
            </div>
          </div>
        </div>

        {/* General Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700">Limba implicită</label>
              <p className="text-sm text-gray-500 mb-2">Limba implicită pentru interfața administrativă</p>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="ro">Română</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700">Timeout sesiune (minute)</label>
              <p className="text-sm text-gray-500 mb-2">Timpul după care sesiunea administrativă expiră</p>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={30}>30 minute</option>
                <option value={60}>1 oră</option>
                <option value={120}>2 ore</option>
                <option value={240}>4 ore</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};