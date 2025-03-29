import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';

export function AuthBox() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.login')}</h1>
      <div className="space-y-4">
        <Button
          color="blue"
          className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
          onClick={() => navigate('/register/email')}
        >
          {t('auth.createAccount')}
        </Button>
        <Button
          color="light"
          className="w-full"
          onClick={() => navigate('/login')}
        >
          {t('auth.login')}
        </Button>
      </div>
    </div>
  );
} 