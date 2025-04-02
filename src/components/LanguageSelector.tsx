import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    console.log('Changing language to:', lng);
    console.log('Current language:', i18n.language);
    
    // Store the selected language
    localStorage.setItem('i18nextLng', lng);
    
    // Change the language
    i18n.changeLanguage(lng).then(() => {
      console.log('Language changed successfully');
      console.log('New language:', i18n.language);
      console.log('Current translations:', i18n.getResourceBundle(lng, 'translation'));
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('ro')}
        className={`px-2 py-1 rounded ${i18n.language === 'ro' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        RO
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-2 py-1 rounded ${i18n.language === 'ru' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        RU
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        EN
      </button>
    </div>
  );
};