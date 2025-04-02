import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function Success() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('auth.register.success.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.register.success.message')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              <p>{t('auth.register.success.checkEmail')}</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('auth.register.success.backToLogin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 