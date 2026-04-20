import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'es',
    backend: {
      loadPath: path.resolve(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: false,
    },
    preload: ['es', 'en'],
    ns: ['common'],
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
export { middleware as i18nMiddleware };
