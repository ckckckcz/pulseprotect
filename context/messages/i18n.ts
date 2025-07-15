import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import id from './lang/id.json';
import en from './lang/en.json';

const resources = {
  id: { translation: id },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'id',
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
