import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || resendDisabled) return;

    setLoading(true);
    console.group('Password Reset Request');
    console.log('Attempting to send password reset email to:', email);
    console.log('Redirect URL:', `${window.location.origin}/reset-password/confirm`);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Site URL:', import.meta.env.VITE_SITE_URL);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
        data: {
          email: email
        }
      });

      console.log('Supabase Response:', { data, error });

      if (error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          status: error.status,
          stack: error.stack
        });
        throw error;
      }

      if (!data) {
        console.error('No data returned from Supabase');
        throw new Error('No data returned from Supabase');
      }

      console.log('Password reset email sent successfully');
      setSuccess(true);
      toast.success(t('resetPassword.success'));
      setResendDisabled(true);
      setCountdown(60);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.message || t('resetPassword.error'));
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('resetPassword.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('resetPassword.description')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('resetPassword.emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('resetPassword.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || resendDisabled}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading || resendDisabled
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? (
                t('resetPassword.sending')
              ) : resendDisabled ? (
                `${t('resetPassword.resendDisabled')} (${countdown}s)`
              ) : (
                t('resetPassword.submit')
              )}
            </button>
          </div>

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {t('resetPassword.success')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('resetPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
} 