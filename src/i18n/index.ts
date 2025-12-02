import en from './en.json';
import fr from './fr.json';
import es from './es.json';

export type Locale = 'en' | 'fr' | 'es';

const translations = {
  en,
  fr,
  es
};

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en;
}

export function getLocaleFromUrl(pathname: string): Locale {
  const parts = pathname.split('/').filter(Boolean);
  const firstPart = parts[0];

  if (firstPart === 'fr') return 'fr';
  if (firstPart === 'es') return 'es';
  return 'en';
}

export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  return `/${locale}${path}`;
}
