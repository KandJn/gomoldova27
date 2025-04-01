import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Confirm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('signupEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

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

  const handleResend = async () => {
    if (loading || resendDisabled) return;

    setLoading(true);
    console.group('Signup Confirmation Email Request');
    console.log('Attempting to send confirmation email to:', email);
    console.log('Redirect URL:', `${window.location.origin}/auth/confirm`);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Site URL:', import.meta.env.VITE_SITE_URL);

    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email
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

      console.log('Confirmation email sent successfully');
      toast.success(t('confirm.success'));
      setResendDisabled(true);
      setCountdown(60);
    } catch (error: any) {
      console.error('Error in handleResend:', error);
      toast.error(error.message || t('confirm.error'));
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
            {t('confirm.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('confirm.description')}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  {t('confirm.checkSpam')}
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleResend}
              disabled={loading || resendDisabled}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading || resendDisabled
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? (
                t('confirm.sending')
              ) : resendDisabled ? (
                `${t('confirm.resendDisabled')} (${countdown}s)`
              ) : (
                t('confirm.resend')
              )}
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('confirm.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
} 