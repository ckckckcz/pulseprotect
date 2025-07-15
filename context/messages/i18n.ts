import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  id: {
    translation: {
      hello: 'Halo',
      profile: 'Profil',
      settings: 'Pengaturan',
      logout: 'Keluar',
      // ...tambahkan key lain sesuai kebutuhan
    },
  },
  en: {
    translation: {
      hello: 'Hello',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      // ...tambahkan key lain sesuai kebutuhan
    },
  },
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
