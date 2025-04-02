import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Password() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        throw new Error(t('auth.register.error.passwordMismatch'));
      }

      // Get registration data from sessionStorage with correct keys
      const email = sessionStorage.getItem('registration_email');
      const firstName = sessionStorage.getItem('registration_first_name');
      const lastName = sessionStorage.getItem('registration_last_name');
      const gender = sessionStorage.getItem('registration_gender');

      if (!email || !firstName || !lastName || !gender) {
        throw new Error(t('auth.register.error.missingData'));
      }

      try {
        // Try to sign up with Supabase Auth
        console.log('Attempting signup with:', { email, firstName, lastName, gender });
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              gender: gender,
              full_name: `${firstName} ${lastName}`
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          throw signUpError;
        }

        console.log('Signup successful:', authData);
      } catch (error: any) {
        console.error('Detailed error:', error);
        // If user already exists, resend confirmation email
        if (error.message?.includes('User already registered')) {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
          });

          if (resendError) {
            console.error('Resend error:', resendError);
            throw resendError;
          }
        } else {
          throw error;
        }
      }

      // Clear sensitive data from sessionStorage
      sessionStorage.removeItem('registration_email');
      sessionStorage.removeItem('registration_first_name');
      sessionStorage.removeItem('registration_last_name');
      sessionStorage.removeItem('registration_gender');

      // Store registration data in localStorage for persistence
      localStorage.setItem('registrationEmail', email);
      localStorage.setItem('registrationFullName', `${firstName} ${lastName}`);

      // Sign out immediately after registration to prevent auto-login
      await supabase.auth.signOut();

      // Redirect to confirmation page
      navigate('/register/success');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('auth.createPassword')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pasul 5 din 5 • Parola
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                  placeholder={t('auth.password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.confirmPassword')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                  placeholder={t('auth.confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Link
                to="/register/gender"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                {t('common.back')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : t('auth.register.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}