import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Button, Spinner, Label, TextInput } from 'flowbite-react';
import { useAuthStore } from '../../lib/store';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already authenticated and redirect to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success(t('auth.login.success'));
      navigate('/');
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.login')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value={t('auth.email')} />
            </div>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('auth.enterEmail')}
              autoComplete="email"
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value={t('auth.password')} />
            </div>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.enterPassword')}
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/reset-password')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {t('auth.forgotPassword')}
            </button>
          </div>

          <Button
            type="submit"
            color="blue"
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t('common.loading')}
              </>
            ) : (
              t('auth.login')
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register/email')}
              className="text-base text-blue-600 hover:text-blue-700"
            >
              {t('auth.noAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 