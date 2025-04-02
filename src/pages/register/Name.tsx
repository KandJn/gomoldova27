import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const nameSchema = z.object({
  firstName: z.string().min(2, 'auth.register.name.firstName.error'),
  lastName: z.string().min(2, 'auth.register.name.lastName.error'),
});

type NameFormData = z.infer<typeof nameSchema>;

export function RegisterName() {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { updateRegistrationData } = useAuth();
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);

  // Load translations
  const translations = {
    title: t('auth.register.name.title'),
    step: t('auth.register.name.step'),
    firstName: {
      label: t('auth.register.name.firstName.label'),
      placeholder: t('auth.register.name.firstName.placeholder'),
      error: t('auth.register.name.firstName.error')
    },
    lastName: {
      label: t('auth.register.name.lastName.label'),
      placeholder: t('auth.register.name.lastName.placeholder'),
      error: t('auth.register.name.lastName.error')
    },
    back: t('auth.register.name.back'),
    continue: t('auth.register.name.continue')
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
  });

  useEffect(() => {
    // Check if email exists in session storage
    const email = sessionStorage.getItem('registration_email');
    if (!email) {
      navigate('/register/email');
    }
  }, [navigate]);

  const onSubmit = async (data: NameFormData) => {
    setIsSubmitting(true);
    try {
      // Store both full name and individual parts in session storage and local storage
      const fullName = `${data.firstName} ${data.lastName}`;
      
      sessionStorage.setItem('registration_name', fullName);
      sessionStorage.setItem('registration_first_name', data.firstName);
      sessionStorage.setItem('registration_last_name', data.lastName);
      
      localStorage.setItem('registration_name', fullName);
      localStorage.setItem('registration_first_name', data.firstName);
      localStorage.setItem('registration_last_name', data.lastName);
      
      navigate('/register/birthyear');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language changed in component:', i18n.language);
      // Force a re-render
      setForceUpdate(prev => !prev);
      setForceUpdate(prev => !prev);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {translations.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {translations.step}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    {translations.firstName.label}
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('firstName')}
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={translations.firstName.placeholder}
                    />
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">
                        {translations.firstName.error}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    {translations.lastName.label}
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('lastName')}
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={translations.lastName.placeholder}
                    />
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">
                        {translations.lastName.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/register/email')}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {translations.back}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                  ) : (
                    translations.continue
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}