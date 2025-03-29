import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { sendPasswordResetEmail } from '../../lib/emailService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Label, TextInput } from 'flowbite-react';

export function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting password reset process for email:', email);

    try {
      setLoading(true);

      // First, check if the user exists
      console.log('Checking if user exists...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Error checking user:', userError);
        if (userError.code === 'PGRST116') {
          // User not found
          console.log('User not found in database');
          toast.error(t('auth.resetPassword.userNotFound'));
          return;
        }
        throw userError;
      }

      if (!userData) {
        console.log('User not found in database');
        toast.error(t('auth.resetPassword.userNotFound'));
        return;
      }

      console.log('User found, sending reset email...');
      // User exists, send the reset email
      await sendPasswordResetEmail(email);
      
      console.log('Reset email sent successfully');
      toast.success(t('auth.resetPassword.success'));
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error in password reset:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(t('auth.resetPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.resetPassword.title')}</h1>
        <p className="text-gray-600 mb-6 text-center">
          {t('auth.resetPassword.description')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value={t('auth.resetPassword.email')} />
            </div>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('auth.resetPassword.enterEmail')}
              autoComplete="email"
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
              t('auth.resetPassword.submit')
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 