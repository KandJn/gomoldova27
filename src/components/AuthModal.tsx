import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        if (data.user) {
          setUser(data.user);
          toast.success(t('auth.loginSuccess'));
        }
        
        onClose();
      } else {
        // Handle registration
        // Add your registration logic here
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onClose();
    navigate('/reset-password');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-xl rounded-lg bg-white p-8 md:p-12 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="text-3xl font-medium text-gray-900">
              {isLogin ? t('auth.login') : t('auth.register')}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-base font-medium text-gray-700">
                  {t('auth.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3"
                required
              />
            </div>

            {error && (
              <div className="text-base text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-base text-blue-600 hover:text-blue-700"
              >
                {t('auth.forgotPassword.title')}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : (isLogin ? t('auth.login') : t('auth.register'))}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                onClose();
                navigate('/register/email');
              }}
              className="text-base text-blue-600 hover:text-blue-700"
            >
              {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}