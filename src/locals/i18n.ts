import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation scrolls
import en from './en.json';
import ru from './ru.json';
import hy from './hy.json';

i18n
  .use(LanguageDetector) // Automatically detects user browser language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      hy: { translation: hy }
    },
    fallbackLng: 'en', // If language is missing, use English
    interpolation: {
      escapeValue: false // React already protects from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'] // Remember choice for next visit
    }
  });

export default i18n;