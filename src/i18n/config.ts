import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from './locales/en.json';
import roTranslations from './locales/ro.json';
import ruTranslations from './locales/ru.json';

// Log the specific translation key we're having trouble with
console.log('Translation key check:', {
  en: enTranslations?.auth?.register?.name?.title,
  ro: roTranslations?.auth?.register?.name?.title,
  ru: ruTranslations?.auth?.register?.name?.title
});

console.log('Initializing i18n with translations:', {
  en: enTranslations,
  ro: roTranslations,
  ru: ruTranslations
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    supportedLngs: ['ro', 'ru', 'en'],
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false
    },
    returnEmptyString: false,
    returnNull: false,
    returnObjects: true,
    load: 'all',
    resources: {
      en: { translation: enTranslations },
      ro: { translation: roTranslations },
      ru: { translation: ruTranslations }
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  }).then(() => {
    console.log('i18n initialized successfully');
    console.log('Current language:', i18n.language);
    console.log('Available languages:', i18n.languages);
    
    // Test all auth translations
    const authKeys = [
      'auth.register.name.title',
      'auth.register.name.step',
      'auth.register.name.firstName.label',
      'auth.register.name.firstName.placeholder',
      'auth.register.name.firstName.error',
      'auth.register.name.lastName.label',
      'auth.register.name.lastName.placeholder',
      'auth.register.name.lastName.error',
      'auth.register.name.back',
      'auth.register.name.continue'
    ];

    console.log('Testing auth translations:');
    authKeys.forEach(key => {
      const translation = i18n.t(key);
      console.log(`Key: ${key}`, {
        translation,
        language: i18n.language,
        hasTranslation: i18n.exists(key),
        raw: i18n.getResource(i18n.language, 'translation', key)
      });
    });
  });

// Add event listener for language changes
i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  
  // Test all auth translations after language change
  const authKeys = [
    'auth.register.name.title',
    'auth.register.name.step',
    'auth.register.name.firstName.label',
    'auth.register.name.firstName.placeholder',
    'auth.register.name.firstName.error',
    'auth.register.name.lastName.label',
    'auth.register.name.lastName.placeholder',
    'auth.register.name.lastName.error',
    'auth.register.name.back',
    'auth.register.name.continue'
  ];

  console.log('Testing auth translations after language change:');
  authKeys.forEach(key => {
    const translation = i18n.t(key);
    console.log(`Key: ${key}`, {
      translation,
      language: i18n.language,
      hasTranslation: i18n.exists(key),
      raw: i18n.getResource(i18n.language, 'translation', key)
    });
  });
});

export default i18n; 