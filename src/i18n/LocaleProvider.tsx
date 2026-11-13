import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Bilingual, Locale } from '@/i18n/locale';

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  tr: (text: Bilingual) => string;
  /** Inline helper: t('English', 'Bahasa Indonesia'). */
  t: (en: string, id: string) => string;
};

// The choice is kept only for the current tab (e.g. home -> verification
// page and back). Every new visit starts in English on all devices; the old
// permanent "ariju-locale" key is ignored so earlier saved choices don't win.
export const STORAGE_KEY = 'ariju-locale-session';

function initialLocale(): Locale {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === 'id' || saved === 'en') return saved;
  } catch {
    // ignore
  }
  return 'en';
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.setAttribute('translate', 'no');
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled: the choice just isn't remembered.
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      tr: (text) => text[locale],
      t: (en, id) => (locale === 'id' ? id : en),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
