import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { sendConfirmationEmail } from '../../lib/emailService';
import { Mail, ArrowLeft, RefreshCw, Inbox, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Confirm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      const token = searchParams.get('token');

      if (!type || !token) {
        const pendingRegistration = localStorage.getItem('pending_registration');
        if (!pendingRegistration) {
          console.log('No pending registration found, redirecting to home');
          navigate('/', { replace: true });
          return;
        }
        const { email } = JSON.parse(pendingRegistration);
        setEmail(email);
        setIsLoading(false);
        return;
      }
    };

    checkAccess();
  }, [navigate, location]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setError(null);

    try {
      const email = localStorage.getItem('registrationEmail');
      if (!email) {
        throw new Error(t('auth.confirm.error.noEmail'));
      }

      // Use Supabase's built-in resend confirmation email
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) throw resendError;

      toast.success(t('auth.confirm.emailResent'));
      setLastResendTime(Date.now());
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('auth.register.noPendingRegistration')}
          </h2>
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700"
          >
            {t('auth.register.startRegistration')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Link
            to="/register"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')}
          </Link>
          
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('auth.register.checkYourEmail')}
            </h2>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-8">
              <div className="flex items-start space-x-4">
                <Inbox className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">
                  {t('auth.register.confirmationEmailSent', { email })}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="-ml-1 mr-2 h-5 w-5" />
                    {t('auth.register.resendEmail')}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <p>{t('auth.register.checkSpamFolder')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 