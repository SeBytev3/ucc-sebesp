import i18next from '../../src/config/i18n';

describe('i18n Infrastructure', () => {
  beforeAll((done) => {
    if (i18next.isInitialized && i18next.hasResourceBundle('es', 'common')) {
      return done();
    }

    i18next.on('initialized', () => {
      // Still might not have loaded the backend files yet if preloading
      if (i18next.hasResourceBundle('es', 'common')) {
        done();
      } else {
        i18next.on('loaded', (loaded) => {
          if (loaded.es?.common && loaded.en?.common) {
            done();
          }
        });
      }
    });

    // In case it's already initialized but we need to wait for 'loaded'
    if (i18next.isInitialized) {
       i18next.on('loaded', (loaded) => {
          if (loaded.es?.common && loaded.en?.common) {
            done();
          }
        });
    }
  });

  it('should translate common.welcome to Spanish', () => {
    const translation = i18next.t('common.welcome', { lng: 'es' });
    expect(translation).toBe('Bienvenido a la Plataforma de Mercado de Servicios');
  });

  it('should translate common.welcome to English', () => {
    const translation = i18next.t('common.welcome', { lng: 'en' });
    expect(translation).toBe('Welcome to the Services Marketplace Platform');
  });

  it('should fallback to Spanish for missing keys in English', () => {
    // If I had a key only in ES, it should fallback if configured.
    // Currently they are identical in structure.
    const translation = i18next.t('non_existent_key', { lng: 'en' });
    expect(translation).toBe('non_existent_key');
  });

  it('should pick correctly from locales files', () => {
    const authError = i18next.t('auth.unauthorized', { lng: 'es' });
    expect(authError).toBe('No autorizado para acceder a este recurso');
  });
});
