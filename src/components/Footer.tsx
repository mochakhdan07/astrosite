import { useLocale } from '@/i18n/useLocale';
import { Mail } from 'lucide-react';
import { EXTRA_SOURCES } from '@/lib/lunarData';

const SUPPORT_EMAIL = 'ariju.vii.project@proton.me';

export default function Footer() {
  const { t, tr } = useLocale();
  return (
    <footer className="border-t border-white/10 px-4 py-10 text-sm text-slate-400 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-base font-semibold text-slate-200">ARIJU-VII</p>
          <p className="mt-1 max-w-md leading-normal">
            {t(
              'AstroSite: Lunar Landing Site Navigator – an educational project for the NASA Space Apps Challenge. An independent project, not officially affiliated with NASA.',
              'AstroSite: Navigator Lokasi Pendaratan Bulan – media edukasi untuk NASA Space Apps Challenge. Proyek independen, tidak berafiliasi resmi dengan NASA.'
            )}
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-300">{t('Additional data sources', 'Sumber data tambahan')}</p>
          <ul className="mt-2 space-y-1">
            {EXTRA_SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">
                  {tr(s.label)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-6">
        <p className="max-w-xl text-left text-xs leading-relaxed text-slate-400">
          <Mail className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px text-cyan-300" aria-hidden="true" />
          {t(
            'Found an error or bug? We would appreciate your report. Please contact our team at ',
            'Menemukan kesalahan atau bug? Kami sangat menghargai laporan Anda. Silakan hubungi tim kami melalui '
          )}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Laporan Error/Bug – ARIJU-VII')}`}
            className="font-semibold text-cyan-300 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          {t(
            ', including a brief description of the issue and the steps to reproduce it.',
            ' dengan menyertakan deskripsi singkat masalah serta langkah-langkah untuk memunculkannya.'
          )}
        </p>
      </div>
    </footer>
  );
}
