import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);
      localStorage.setItem('i18nextLng', lng);
      
      // No longer modifying URL with language prefixes
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`px-2 py-1 rounded text-sm font-medium transition-colors duration-200 ${
          i18n.language === 'ro' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'
        }`}
        onClick={() => changeLanguage('ro')}
        aria-label="Switch to Romanian"
      >
        RO
      </button>
      <span className="text-gray-300">|</span>
      <button
        className={`px-2 py-1 rounded text-sm font-medium transition-colors duration-200 ${
          i18n.language === 'ru' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'
        }`}
        onClick={() => changeLanguage('ru')}
        aria-label="Switch to Russian"
      >
        RU
      </button>
      <span className="text-gray-300">|</span>
      <button
        className={`px-2 py-1 rounded text-sm font-medium transition-colors duration-200 ${
          i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'
        }`}
        onClick={() => changeLanguage('en')}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}