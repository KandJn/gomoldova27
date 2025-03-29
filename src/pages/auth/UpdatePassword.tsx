import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button, Spinner, Label, TextInput } from 'flowbite-react';

export function UpdatePassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('UpdatePassword component mounted');
    console.log('Location:', location);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    // Check if we have a session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Current session:', session);
      
      if (error) {
        console.error('Error getting session:', error);
        toast.error(t('auth.updatePassword.invalidToken'));
        navigate('/');
        return;
      }

      if (!session) {
        console.error('No active session');
        toast.error(t('auth.updatePassword.invalidToken'));
        navigate('/');
        return;
      }

      console.log('Valid session found');
    });
  }, [navigate, t]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting password reset process...');

    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      toast.error(t('auth.updatePassword.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      console.error('Password too short');
      toast.error(t('auth.updatePassword.passwordTooShort'));
      return;
    }

    try {
      setLoading(true);
      console.log('Updating password...');

      // Update the user's password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }

      console.log('Password updated successfully');
      toast.success(t('auth.updatePassword.success'));
      
      // Sign out the user after password update
      await supabase.auth.signOut();
      
      // Redirect to main page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(t('auth.updatePassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.updatePassword.title')}</h1>
        <p className="text-gray-600 mb-6 text-center">
          {t('auth.updatePassword.description')}
        </p>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value={t('auth.updatePassword.newPassword')} />
            </div>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.updatePassword.enterNewPassword')}
              autoComplete="new-password"
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword" value={t('auth.updatePassword.confirmPassword')} />
            </div>
            <TextInput
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t('auth.updatePassword.confirmNewPassword')}
              autoComplete="new-password"
            />
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
              t('auth.updatePassword.submit')
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 