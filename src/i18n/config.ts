import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import roTranslations from './locales/ro.json';
import ruTranslations from './locales/ru.json';
import enTranslations from './locales/en.json';

// Only initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      debug: import.meta.env.DEV, // Only enable debug in development
      fallbackLng: 'ro',
      supportedLngs: ['ro', 'ru', 'en'],
      resources: {
        ro: {
          translation: roTranslations
        },
        ru: {
          translation: ruTranslations
        },
        en: {
          translation: enTranslations
        }
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false
      }
    });
}

export default i18n; 