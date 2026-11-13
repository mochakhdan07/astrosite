import { useEffect } from 'react';
import { ArrowDown, ArrowRight, Database, Droplets, ListChecks, MousePointerClick, Radio, Sun, Thermometer, X } from 'lucide-react';
import Moon3D from '@/components/Moon3D';
import { LIGHTING_LABEL, SITES } from '@/lib/lunarData';
import { useLocale } from '@/i18n/useLocale';

type Props = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpenData: (id: string) => void;
};

export default function Hero({ selectedId, onSelect, onOpenData }: Props) {
  const { t, tr, locale } = useLocale();

  // Keep the browser tab title in the chosen language too.
  useEffect(() => {
    document.title =
      locale === 'id'
        ? 'AstroSite: Navigator Lokasi Pendaratan Bulan'
        : 'AstroSite: Lunar Landing Site Navigator';
  }, [locale]);
  const site = SITES.find((s) => s.id === selectedId) ?? null;

  return (
    <section id="top" className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-300">
            NASA Space Apps Challenge 2026
          </p>
          <h1 className="mt-6">
            <span className="font-display block text-5xl font-extrabold leading-none tracking-tight text-cyan-300 drop-shadow-[0_0_28px_rgba(34,211,238,0.35)] sm:text-6xl lg:text-7xl">
              AstroSite
            </span>
            <span className="mt-5 flex items-center gap-3">
              <span className="h-px w-10 shrink-0 bg-gradient-to-r from-cyan-300 to-transparent" aria-hidden="true" />
              <span className="font-display text-xl font-semibold uppercase leading-snug tracking-[0.12em] text-white sm:text-2xl">
                {t('Lunar Landing Site Navigator', 'Navigator Lokasi Pendaratan Bulan')}
              </span>
            </span>
            <span className="mt-2 block text-lg font-medium leading-relaxed text-slate-300 sm:text-xl">
              {t('Exploring a Base on the Moon', 'Menjelajahi Pangkalan di Bulan')}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            {t(
              'An interactive guide built on official NASA data to compare landing sites, analyse extreme lighting, and assess communication windows and power at the lunar south pole.',
              'Alat panduan interaktif berbasis data resmi NASA untuk membandingkan lokasi pendaratan, menganalisis pencahayaan ekstrem, serta menilai jendela komunikasi dan daya di kutub selatan Bulan.'
            )}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#data"
              className="inline-flex items-center justify-center gap-2 glow-btn rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              <Database className="h-4 w-4" aria-hidden="true" /> {t('Explore the data', 'Lihat Data Navigasi')}
            </a>
            <a
              href="#kuis"
              className="inline-flex items-center justify-center gap-2 glow-btn rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 font-bold text-white backdrop-blur-md hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" /> {t('Start the quiz', 'Mulai Kuis')}
            </a>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t('Polar Sun height', 'Tinggi Matahari kutub')}</dt>
              <dd className="font-display text-2xl font-semibold text-white">{t('≤ 1.5°', '≤ 1,5°')}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t('Ridge sunlight', 'Sinar di punggungan')}</dt>
              <dd className="font-display text-2xl font-semibold text-white">{'>'}80%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t('Earth libration', 'Librasi Bumi')}</dt>
              <dd className="font-display text-2xl font-semibold text-white">±7°</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <Moon3D selectedId={selectedId} onSelect={(id) => onSelect(id)} />
          <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <MousePointerClick className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
            {t('Drag to rotate · click a marker to see the site', 'Seret untuk memutar · klik titik untuk melihat lokasi')}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SITES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                aria-pressed={s.id === selectedId}
                className={`glow-btn inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  s.id === selectedId
                    ? 'border-white bg-white text-slate-950'
                    : 'border-white/15 bg-white/[0.04] text-slate-200 backdrop-blur-md hover:border-cyan-300/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${s.status === 'historic' ? 'bg-amber-300' : 'bg-cyan-300'}`} />
                {s.short}
              </button>
            ))}
          </div>

          {site && (
            <div
              role="dialog"
              aria-label={tr(site.name)}
              className="relative mt-4 glass rounded-2xl !bg-slate-900/70 p-5 lg:absolute lg:left-0 lg:top-0 lg:mt-0 lg:w-72"
            >
              <button
                type="button"
                onClick={() => onSelect(null)}
                aria-label={t('Close', 'Tutup')}
                className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <p
                className={`text-[11px] font-bold uppercase tracking-widest ${
                  site.status === 'historic' ? 'text-amber-300' : 'text-cyan-300'
                }`}
              >
                {site.status === 'historic' ? t('Historic landing', 'Pendaratan historis') : t('Potential zone', 'Zona potensial')}
              </p>
              <p className="font-display mt-1 pr-6 text-lg font-semibold leading-tight text-white">{tr(site.name)}</p>
              <p className="text-xs text-slate-400">{tr(site.mission)}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <Sun className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" /> {tr(LIGHTING_LABEL[site.lighting])}
                </li>
                <li className="flex items-start gap-2">
                  <Radio className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                  {site.earthVisible[0] === 100
                    ? t('Earth link: continuous', 'Kontak Bumi: terus-menerus')
                    : site.earthVisible[1] === 0
                      ? t('Earth link: blocked (relay needed)', 'Kontak Bumi: terhalang (perlu relai)')
                      : t('Earth link: in windows', 'Kontak Bumi: berjendela waktu')}
                </li>
                <li className="flex items-start gap-2">
                  <Thermometer className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
                  {site.tempMin} °C … {site.tempMax} °C
                </li>
                <li className="flex items-start gap-2">
                  <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                  {site.waterIce ? t('Water ice: confirmed nearby', 'Es air: terkonfirmasi') : t('Water ice: none', 'Es air: tidak ada')}
                </li>
              </ul>
              <button
                type="button"
                onClick={() => onOpenData(site.id)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 glow-btn rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
              >
                {t('Open full data', 'Buka data lengkap')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
      <a
        href="#data"
        aria-label={t('Scroll to navigation data', 'Gulir ke data navigasi')}
        className="mx-auto mt-12 flex h-10 w-10 items-center justify-center glow-btn rounded-full border border-white/15 bg-white/[0.04] text-slate-300 backdrop-blur-md hover:border-white/40 hover:text-white"
      >
        <ArrowDown className="h-4 w-4" />
      </a>
    </section>
  );
}
