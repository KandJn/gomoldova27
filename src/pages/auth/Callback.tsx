import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function Callback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token and type from the URL hash fragment
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const token = hashParams.get('access_token');
        const type = hashParams.get('type');

        console.log('Full URL:', window.location.href);
        console.log('Hash params:', Object.fromEntries(hashParams.entries()));

        if (!token || !type) {
          console.error('Missing token or type in URL hash');
          toast.error(t('auth.callback.invalidLink'));
          navigate('/login');
          return;
        }

        // Verify the email using the token
        const { data, error } = await supabase.auth.verifyOtp({
          token,
          type: type as 'signup' | 'recovery' | 'invite' | 'email',
        });

        console.log('Verification response:', { data, error });

        if (error) {
          console.error('Error verifying email:', error);
          toast.error(t('auth.callback.error'));
          navigate('/login');
          return;
        }

        if (!data.session) {
          console.error('No session after verification');
          toast.error(t('auth.callback.noSession'));
          navigate('/login');
          return;
        }

        // Set the user in the auth store
        setUser(data.session.user);

        // Show success message
        toast.success(t('auth.callback.success'));

        // Redirect to home page
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error in callback:', error);
        toast.error(t('auth.callback.error'));
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, t, setUser, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {t('auth.callback.verifying')}
          </h2>
          <p className="text-gray-600">
            {t('auth.callback.pleaseWait')}
          </p>
        </div>
      </div>
    </div>
  );
} 