import { useEffect, useState } from 'react';
import { useLocale } from '@/i18n/useLocale';
import type { Locale } from '@/i18n/locale';

const LANGS: { code: Locale; label: string; name: string }[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'id', label: 'ID', name: 'Bahasa Indonesia' },
];

// On other pages (e.g. certificate verification) the section links point back
// to the home page instead of to anchors that don't exist there.
export default function Header({ home = false }: { home?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  const base = home ? '' : '/';
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { href: '#data', label: t('Navigation Data', 'Data Navigasi') },
    { href: '#kuis', label: t('Quiz', 'Kuis') },
    { href: '#sertifikat', label: t('Certificate', 'Sertifikat') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? 'border-white/10 bg-[#070c24]/70 shadow-lg shadow-black/30 backdrop-blur-xl' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a href={home ? '#top' : '/'} className="flex min-w-0 items-center gap-3">
          <img
            src="/Space_Apps_Logo_Color_and_White.width-440.jpegquality-60.png"
            alt={t('NASA Space Apps Challenge logo', 'Logo NASA Space Apps Challenge')}
            className="h-9 w-auto shrink-0 sm:h-11"
          />
          <span className="min-w-0 border-l border-white/20 pl-3">
            <span className="font-display block truncate text-sm font-semibold text-white sm:text-base">
              NASA Space Apps Challenge 2026
            </span>
            <span className="block truncate text-[11px] text-slate-400 sm:text-xs">
              ARIJU-VII | Mochamad Akhdan Rifqi Junnawwar
            </span>
          </span>
        </a>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <nav aria-label={t('Main navigation', 'Navigasi utama')} className="hidden items-center gap-1 text-sm font-semibold lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={`${base}${item.href}`}
                className="glow-btn rounded-full px-3 py-1.5 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div
            role="group"
            aria-label={t('Choose language', 'Pilih bahasa')}
            className="flex rounded-full border border-white/20 bg-white/[0.05] p-0.5 backdrop-blur-md text-xs font-bold"
          >
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                aria-pressed={locale === lang.code}
                title={lang.name}
                lang={lang.code}
                className={`rounded-full px-3 py-1.5 transition ${
                  locale === lang.code ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
