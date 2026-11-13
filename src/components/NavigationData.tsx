import { useState } from 'react';
import {
  BookOpen,
  Droplets,
  Earth,
  ExternalLink,
  Gauge,
  LayoutGrid,
  MapPin,
  Moon,
  Mountain,
  Radio,
  Sun,
  Table2,
  Thermometer,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocale } from '@/i18n/useLocale';
import { CRITERIA, GLOSSARY, LIGHTING_LABEL, SITES, type Criterion, type LandingSite, type Lighting } from '@/lib/lunarData';

const LIGHT_STYLE: Record<Lighting, string> = {
  cycle: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
  'near-constant': 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200',
  'permanent-shadow': 'border-indigo-300/40 bg-indigo-400/15 text-indigo-200',
};

const CRITERION_ICON: Record<Criterion, LucideIcon> = {
  sunlight: Sun,
  water: Droplets,
  temperature: Thermometer,
  terrain: Mountain,
  comms: Radio,
};

const MAX_SCORE = 5;
const MAX_TOTAL = CRITERIA.length * MAX_SCORE;
const totalScore = (site: LandingSite) => CRITERIA.reduce((sum, c) => sum + site.scores[c.key], 0);

function LightIcon({ lighting, className }: { lighting: Lighting; className?: string }) {
  return lighting === 'permanent-shadow' ? <Moon className={className} /> : <Sun className={className} />;
}

function IceBadge({ site }: { site: LandingSite }) {
  const { t } = useLocale();
  const yes = site.waterIce;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
        yes ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-200' : 'border-slate-500/40 bg-slate-700/30 text-slate-300'
      }`}
    >
      <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
      {yes ? t('Water ice: confirmed', 'Es air: terkonfirmasi') : t('Water ice: none', 'Es air: tidak ada')}
    </span>
  );
}

function CommsBadge({ site }: { site: LandingSite }) {
  const { t } = useLocale();
  const [a, b] = site.earthVisible;
  const style =
    a === 100
      ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200'
      : b === 0
        ? 'border-rose-300/40 bg-rose-400/10 text-rose-200'
        : 'border-sky-300/40 bg-sky-300/10 text-sky-200';
  const label =
    a === 100
      ? t('Continuous (100%)', 'Terus-menerus (100%)')
      : b === 0
        ? t('None – relay needed', 'Tidak ada – perlu relai')
        : t(`Windows (≈${a}–${b}%)`, `Berjendela (±${a}–${b}%)`);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${style}`}>
      <Radio className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

function scoreColor(v: number) {
  if (v >= 4) return 'bg-emerald-400';
  if (v >= 2) return 'bg-amber-300';
  return 'bg-rose-400';
}

/** 0–5 rating bars for one site, per navigation criterion. */
function Scorecard({ site }: { site: LandingSite }) {
  const { t, tr } = useLocale();
  const total = totalScore(site);
  return (
    <div className="glass-soft glow-hover rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Gauge className="h-4 w-4 text-cyan-300" aria-hidden="true" /> {t('Base suitability score', 'Skor kelayakan pangkalan')}
        </p>
        <p className="font-display text-lg font-semibold text-white">
          {total}
          <span className="text-sm text-slate-400"> / {MAX_TOTAL}</span>
        </p>
      </div>
      <ul className="mt-4 space-y-3">
        {CRITERIA.map((c) => {
          const Icon = CRITERION_ICON[c.key];
          const v = site.scores[c.key];
          return (
            <li key={c.key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" /> {tr(c.label)}
                </span>
                <span className="font-mono text-xs text-slate-300">
                  {v}/{MAX_SCORE}
                </span>
              </div>
              <div
                className="mt-1.5 grid grid-cols-5 gap-1"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={MAX_SCORE}
                aria-valuenow={v}
                aria-label={tr(c.label)}
              >
                {Array.from({ length: MAX_SCORE }, (_, i) => (
                  <span key={i} className={`h-2 rounded-full ${i < v ? scoreColor(v) : 'bg-slate-800'}`} />
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">{tr(c.hint)}</p>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-semibold text-slate-200">
            <Sun className="h-4 w-4 text-amber-300" aria-hidden="true" /> {t('Time in sunlight', 'Waktu tersinari Matahari')}
          </span>
          <span className="font-mono text-xs text-slate-300">
            {site.lighting === 'near-constant' ? '>' : '≈'}
            {site.sunlitPercent}%
          </span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-200" style={{ width: `${site.sunlitPercent}%` }} />
        </div>
      </div>
    </div>
  );
}

/** Sites ranked by their total suitability score. */
function Ranking({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const { t, tr } = useLocale();
  const ranked = [...SITES].sort((a, b) => totalScore(b) - totalScore(a));
  return (
    <figure className="glass glow-hover rounded-2xl p-5 sm:p-6">
      <figcaption className="flex items-center gap-2 font-display text-lg font-semibold text-white">
        <Trophy className="h-5 w-5 text-amber-300" aria-hidden="true" /> {t('Long-term base ranking', 'Peringkat pangkalan jangka panjang')}
      </figcaption>
      <p className="mt-1 text-sm text-slate-400">
        {t(
          'Total of the five criteria (solar energy, water ice, temperature, terrain, Earth contact). Click a site to open it.',
          'Jumlah lima kriteria (energi surya, es air, suhu, medan, kontak ke Bumi). Klik lokasi untuk membukanya.'
        )}
      </p>
      <ol className="mt-5 space-y-3">
        {ranked.map((site, i) => {
          const total = totalScore(site);
          const active = site.id === activeId;
          return (
            <li key={site.id}>
              <button
                type="button"
                onClick={() => onSelect(site.id)}
                aria-pressed={active}
                className={`w-full rounded-lg px-2 py-2 text-left transition ${active ? 'bg-white/[0.07] ring-1 ring-cyan-300/30' : 'hover:bg-white/[0.06] hover:ring-1 hover:ring-white/15'}`}
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className={`font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] text-slate-300">
                      {i + 1}
                    </span>
                    {tr(site.mission)}
                  </span>
                  <span className="font-mono text-xs text-slate-300">
                    {total}/{MAX_TOTAL}
                  </span>
                </div>
                <div className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-white/10">
                  {CRITERIA.map((c, ci) => (
                    <span
                      key={c.key}
                      title={`${tr(c.label)}: ${site.scores[c.key]}`}
                      className={['bg-amber-300', 'bg-cyan-300', 'bg-rose-300', 'bg-emerald-300', 'bg-violet-300'][ci]}
                      style={{ width: `${(site.scores[c.key] / MAX_TOTAL) * 100}%` }}
                    />
                  ))}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        {CRITERIA.map((c, ci) => (
          <span key={c.key} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${['bg-amber-300', 'bg-cyan-300', 'bg-rose-300', 'bg-emerald-300', 'bg-violet-300'][ci]}`} />
            {tr(c.label)}
          </span>
        ))}
      </div>
    </figure>
  );
}

function Glossary() {
  const { t, tr } = useLocale();
  return (
    <div className="mt-6 glass glow-hover rounded-2xl p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
        <BookOpen className="h-5 w-5 text-cyan-300" aria-hidden="true" /> {t('Navigator glossary', 'Kamus navigator')}
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        {t('Key terms used in the data and the quiz.', 'Istilah penting yang dipakai di data dan kuis.')}
      </p>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GLOSSARY.map((g) => (
          <div key={g.term} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <dt className="font-display font-semibold text-cyan-200">{g.term}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-300">{tr(g.text)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
// Sun vs Earth elevation above the local horizon, per site (−10° … 90°).
const ELEV_MIN = -10;
const ELEV_MAX = 90;
const ELEV_TICKS = [-10, 0, 15, 30, 45, 60, 75, 90];
const ePct = (v: number) => ((Math.min(Math.max(v, ELEV_MIN), ELEV_MAX) - ELEV_MIN) / (ELEV_MAX - ELEV_MIN)) * 100;

function visibleText(site: LandingSite) {
  const [a, b] = site.earthVisible;
  return a === b ? `${a}%` : `${a}–${b}%`;
}

function SunEarthChart({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const { t, tr } = useLocale();
  return (
    <figure className="glass glow-hover rounded-2xl p-5 sm:p-6">
      <figcaption className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-white">
        <Sun className="h-5 w-5 text-amber-300" aria-hidden="true" />
        <Earth className="h-5 w-5 text-sky-300" aria-hidden="true" />
        {t('Sun & Earth angle evaluation (elevation above the horizon)', 'Evaluasi sudut Matahari & Bumi (elevasi di atas cakrawala)')}
      </figcaption>
      <p className="mt-1 text-sm text-slate-400">
        {t(
          'Sun bar = highest Sun elevation (solar power potential). Earth bar = range of Earth elevation through libration (direct radio link). Below 0° the body is under the horizon.',
          'Batang Matahari = elevasi Matahari tertinggi (potensi daya surya). Batang Bumi = rentang elevasi Bumi akibat librasi (jalur radio langsung). Di bawah 0° berarti berada di bawah cakrawala.'
        )}
      </p>
      <div className="mt-6 space-y-4">
        {SITES.map((site) => {
          const active = site.id === activeId;
          const zero = ePct(0);
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => onSelect(site.id)}
              aria-pressed={active}
              className={`grid w-full grid-cols-1 items-center gap-2 rounded-lg px-2 py-2 text-left transition sm:grid-cols-[11rem_1fr_7rem] sm:gap-4 ${
                active ? 'bg-white/[0.07] ring-1 ring-cyan-300/30' : 'hover:bg-white/[0.06] hover:ring-1 hover:ring-white/15'
              }`}
            >
              <span className={`truncate text-sm font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>{tr(site.mission)}</span>
              <span className="relative block space-y-1.5">
                <span className="absolute inset-y-0 w-px bg-slate-500" style={{ left: `${zero}%` }} aria-hidden="true" />
                <span className="relative block h-3 rounded-full bg-white/10">
                  {site.sunMaxElevation > 0 && (
                    <span
                      className={`absolute inset-y-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-200 ${active ? 'ring-2 ring-white/70' : ''}`}
                      style={{ left: `${zero}%`, width: `${Math.max(ePct(site.sunMaxElevation) - zero, 1.2)}%` }}
                    />
                  )}
                </span>
                <span className="relative block h-3 rounded-full bg-white/10">
                  {site.earthVisible[1] > 0 ? (
                    <span
                      className={`absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-500 to-cyan-200 ${active ? 'ring-2 ring-white/70' : ''}`}
                      style={{ left: `${ePct(site.earthElevMin)}%`, width: `${Math.max(ePct(site.earthElevMax) - ePct(site.earthElevMin), 1.2)}%` }}
                    />
                  ) : (
                    <span
                      className="absolute inset-y-0 rounded-full border border-dashed border-rose-300/60"
                      style={{ left: `${ePct(site.earthElevMin)}%`, width: `${ePct(site.earthElevMax) - ePct(site.earthElevMin)}%` }}
                    />
                  )}
                </span>
              </span>
              <span className="flex gap-3 font-mono text-[11px] text-slate-300 sm:flex-col sm:gap-0.5">
                <span className="text-amber-200">{t('Sun', 'Matahari')} {site.sunMaxElevation > 0 ? `${String(site.sunMaxElevation).replace('.', t('.', ','))}°` : t('none', 'tidak ada')}</span>
                <span className="text-sky-200">{t('Earth LOS', 'LOS Bumi')} {visibleText(site)}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative ml-2 mt-3 h-5 text-[11px] text-slate-500 sm:ml-[12rem] sm:mr-[8rem]" aria-hidden="true">
        {ELEV_TICKS.map((tick) => (
          <span key={tick} className="absolute -translate-x-1/2" style={{ left: `${ePct(tick)}%` }}>
            {tick}°
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-200" /> {t('Max Sun elevation', 'Elevasi Matahari maks.')}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-200" /> {t('Earth elevation range', 'Rentang elevasi Bumi')}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full border border-dashed border-rose-300/60" /> {t('Earth blocked by crater walls', 'Bumi terhalang dinding kawah')}</span>
        <span>LOS = {t('share of time with direct line of sight to Earth (estimate)', 'persentase waktu dengan garis pandang langsung ke Bumi (estimasi)')}</span>
      </div>
    </figure>
  );
}

// Common °C axis for every site so ranges are directly comparable.
const AXIS_MIN = -250;
const AXIS_MAX = 150;
const TICKS = [-250, -200, -150, -100, -50, 0, 50, 100, 150];
const pct = (v: number) => ((v - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

function TemperatureChart({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const { t, tr } = useLocale();
  return (
    <figure className="glass glow-hover rounded-2xl p-5 sm:p-6">
      <figcaption className="flex items-center gap-2 font-display text-lg font-semibold text-white">
        <Thermometer className="h-5 w-5 text-rose-300" aria-hidden="true" /> {t('Estimated surface temperature range (°C)', 'Rentang estimasi suhu permukaan (°C)')}
      </figcaption>
      <p className="mt-1 text-sm text-slate-400">{t('The shorter the bar, the more stable the temperature.', 'Semakin pendek batang, semakin stabil suhunya.')}</p>
      <div className="mt-6 space-y-4">
        {SITES.map((site) => {
          const active = site.id === activeId;
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => onSelect(site.id)}
              className={`grid w-full grid-cols-1 items-center gap-1 rounded-lg px-2 py-1.5 text-left transition sm:grid-cols-[11rem_1fr] sm:gap-4 ${
                active ? 'bg-white/5' : 'hover:bg-white/5'
              }`}
              aria-pressed={active}
            >
              <span className={`truncate text-sm font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>
                {tr(site.mission)}
              </span>
              <span className="relative block h-7">
                <span className="absolute inset-y-3 left-0 right-0 rounded-full bg-white/10" />
                <span className="absolute inset-y-0 w-px bg-slate-500" style={{ left: `${pct(0)}%` }} />
                <span
                  className={`absolute inset-y-1.5 rounded-full ${
                    site.lighting === 'permanent-shadow'
                      ? 'bg-indigo-400'
                      : site.lighting === 'near-constant'
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-sky-400 to-rose-400'
                  } ${active ? 'ring-2 ring-white/70' : 'opacity-80'}`}
                  style={{ left: `${pct(site.tempMin)}%`, width: `${Math.max(pct(site.tempMax) - pct(site.tempMin), 1.5)}%` }}
                />
                <span
                  className="absolute -top-0.5 -translate-x-full pr-1 text-[11px] font-semibold text-slate-300"
                  style={{ left: `${pct(site.tempMin)}%` }}
                >
                  {site.tempMin}
                </span>
                <span
                  className="absolute -top-0.5 pl-1 text-[11px] font-semibold text-slate-300"
                  style={{ left: `${pct(site.tempMax)}%` }}
                >
                  {site.tempMax}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative ml-2 mt-3 h-5 text-[11px] text-slate-500 sm:ml-[12rem]" aria-hidden="true">
        {TICKS.map((tick) => (
          <span key={tick} className="absolute -translate-x-1/2" style={{ left: `${pct(tick)}%` }}>
            {tick}
          </span>
        ))}
      </div>
    </figure>
  );
}

// Simple latitude/longitude plot (equirectangular) of the selected sites.
function SiteMap({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const { t } = useLocale();
  const x = (lon: number) => ((lon + 180) / 360) * 360;
  const y = (lat: number) => ((90 - lat) / 180) * 180;
  return (
    <figure className="glass glow-hover rounded-2xl p-5 sm:p-6">
      <figcaption className="flex items-center gap-2 font-display text-lg font-semibold text-white">
        <MapPin className="h-5 w-5 text-cyan-300" aria-hidden="true" /> {t('Coordinate map (latitude × longitude)', 'Peta koordinat (lintang × bujur)')}
      </figcaption>
      <svg viewBox="-8 -8 376 196" className="mt-4 w-full" role="img" aria-label={t('Map of landing site positions', 'Peta posisi lokasi pendaratan')}>
        <rect x="0" y="0" width="360" height="180" rx="6" fill="#0f172a" stroke="#334155" />
        {[-60, -30, 0, 30, 60].map((lat) => (
          <line key={lat} x1="0" x2="360" y1={y(lat)} y2={y(lat)} stroke="#1e293b" strokeDasharray={lat === 0 ? '' : '3 3'} />
        ))}
        {[-120, -60, 0, 60, 120].map((lon) => (
          <line key={lon} y1="0" y2="180" x1={x(lon)} x2={x(lon)} stroke="#1e293b" strokeDasharray={lon === 0 ? '' : '3 3'} />
        ))}
        <rect x="0" y={y(-84)} width="360" height={180 - y(-84)} fill="rgba(103,232,249,0.08)" />
        <text x="4" y={y(-84) - 3} fill="#67e8f9" fontSize="7">{t('Artemis zone (84°–90° S)', 'Zona Artemis (84°–90° LS)')}</text>
        <text x="4" y={y(0) - 3} fill="#64748b" fontSize="7">{t('Equator', 'Khatulistiwa')}</text>
        {SITES.map((s) => {
          const active = s.id === activeId;
          const color = s.status === 'historic' ? '#fcd34d' : '#67e8f9';
          return (
            <g key={s.id} onClick={() => onSelect(s.id)} className="cursor-pointer">
              <circle cx={x(s.lon)} cy={y(s.lat)} r={active ? 7 : 4.5} fill={color} fillOpacity={active ? 1 : 0.75} stroke="#020617" strokeWidth="1.5" />
              {active && <circle cx={x(s.lon)} cy={y(s.lat)} r="11" fill="none" stroke={color} strokeOpacity="0.6" />}
              <text
                x={x(s.lon) + 9}
                y={y(s.lat) + (s.id === 'psr-cabeus' ? -6 : 3)}
                fill={active ? '#fff' : '#94a3b8'}
                fontSize="8"
                fontWeight="600"
              >
                {s.short}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> {t('Historic landing', 'Pendaratan historis')}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> {t('Potential zone (south pole)', 'Zona potensial (kutub selatan)')}</span>
      </div>
    </figure>
  );
}

function SiteDetail({ site }: { site: LandingSite }) {
  const { t, tr } = useLocale();
  return (
    <article className="glass glow-hover rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
            site.status === 'historic' ? 'bg-amber-300 text-slate-950' : 'bg-cyan-300 text-slate-950'
          }`}
        >
          {site.status === 'historic' ? t('Historic site', 'Situs historis') : t('Potential zone', 'Zona potensial')}
        </span>
        <span className="text-sm text-slate-400">{tr(site.year)}</span>
      </div>
      <h3 className="font-display mt-3 text-2xl font-semibold text-white sm:text-3xl">{tr(site.name)}</h3>
      <p className="text-slate-400">
        {tr(site.mission)} · {tr(site.region)}
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="h-4 w-4 text-cyan-300" aria-hidden="true" /> {t('Coordinates', 'Koordinat')}
          </dt>
          <dd className="mt-2 font-mono text-sm text-white">{tr(site.coordText)}</dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Thermometer className="h-4 w-4 text-rose-300" aria-hidden="true" /> {t('Estimated temperature', 'Estimasi suhu')}
          </dt>
          <dd className="mt-2 text-sm text-white">{tr(site.tempText)}</dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <LightIcon lighting={site.lighting} className="h-4 w-4 text-amber-300" /> {t('Lighting conditions', 'Kondisi pencahayaan')}
          </dt>
          <dd className="mt-2">
            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${LIGHT_STYLE[site.lighting]}`}>
              {tr(LIGHTING_LABEL[site.lighting])}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{tr(site.lightingText)}</p>
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Droplets className="h-4 w-4 text-cyan-300" aria-hidden="true" /> {t('Resources', 'Sumber daya')}
          </dt>
          <dd className="mt-2">
            <IceBadge site={site} />
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{tr(site.resources)}</p>
          </dd>
        </div>
        <div className="glass-soft glow-hover rounded-xl !border-amber-300/25 !bg-amber-300/[0.05] p-4">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sun className="h-4 w-4 text-amber-300" aria-hidden="true" /> {t('Sun angle & power generation', 'Sudut Matahari & pembangkitan daya')}
          </dt>
          <dd className="mt-2">
            <span className="inline-block rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-0.5 text-xs font-bold text-amber-200">
              {site.sunMaxElevation > 0
                ? t(`Max Sun elevation ≈ ${site.sunMaxElevation}°`, `Elevasi Matahari maks. ±${String(site.sunMaxElevation).replace('.', ',')}°`)
                : t('No direct sunlight', 'Tanpa sinar Matahari langsung')}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{tr(site.powerText)}</p>
          </dd>
        </div>
        <div className="glass-soft glow-hover rounded-xl !border-sky-300/25 !bg-sky-300/[0.05] p-4">
          <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Radio className="h-4 w-4 text-sky-300" aria-hidden="true" /> {t('Direct line of sight to Earth', 'Jalur komunikasi langsung ke Bumi')}
          </dt>
          <dd className="mt-2">
            <CommsBadge site={site} />
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{tr(site.commsText)}</p>
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <Scorecard site={site} />
      </div>

      <ul className="mt-6 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
        {site.keyFacts.map((f) => (
          <li key={f.en} className="rounded-lg border-l-2 border-cyan-400/60 bg-white/[0.02] px-3 py-2">
            {tr(f)}
          </li>
        ))}
      </ul>

      <p className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-relaxed text-emerald-100">
        <span className="font-bold">{t('Navigation analysis: ', 'Analisis navigasi: ')}</span>
        {tr(site.verdict)}
      </p>
      <a
        href={site.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:underline"
      >
        {t('Source', 'Sumber')}: {tr(site.source.label)} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </article>
  );
}

function ComparisonTable({ onSelect }: { onSelect: (id: string) => void }) {
  const { t, tr } = useLocale();
  return (
    <div className="glass glass-table overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th scope="col" className="px-4 py-3">{t('Site', 'Lokasi')}</th>
            <th scope="col" className="px-4 py-3">{t('Coordinates', 'Koordinat')}</th>
            <th scope="col" className="px-4 py-3">{t('Lighting', 'Pencahayaan')}</th>
            <th scope="col" className="px-4 py-3">{t('Sun angle (power)', 'Sudut Matahari (daya)')}</th>
            <th scope="col" className="px-4 py-3">{t('Earth link', 'Komunikasi ke Bumi')}</th>
            <th scope="col" className="px-4 py-3">{t('Est. temperature', 'Estimasi suhu')}</th>
            <th scope="col" className="px-4 py-3">{t('Water ice', 'Es air')}</th>
            <th scope="col" className="px-4 py-3">{t('Score', 'Skor')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {SITES.map((s) => (
            <tr key={s.id} className="align-top">
              <th scope="row" className="px-4 py-3">
                <button type="button" onClick={() => onSelect(s.id)} className="text-left font-semibold text-white hover:text-cyan-300">
                  {tr(s.mission)}
                  <span className="block text-xs font-normal text-slate-400">{tr(s.name)}</span>
                </button>
              </th>
              <td className="px-4 py-3 font-mono text-xs text-slate-300">{tr(s.coordText)}</td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${LIGHT_STYLE[s.lighting]}`}>
                  {tr(LIGHTING_LABEL[s.lighting])}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">
                {s.sunMaxElevation > 0 ? `≤ ${String(s.sunMaxElevation).replace('.', t('.', ','))}°` : t('None', 'Tidak ada')}
                <span className="block text-xs text-slate-500">
                  {s.lighting === 'near-constant'
                    ? t('Vertical tracking panels', 'Panel tegak pelacak')
                    : s.lighting === 'cycle'
                      ? t('Flat panels, 14-day night', 'Panel datar, malam 14 hari')
                      : t('Power must be imported', 'Daya harus dipasok')}
                </span>
              </td>
              <td className="px-4 py-3">
                <CommsBadge site={s} />
                <span className="mt-1 block text-xs text-slate-500">
                  {t('Earth', 'Bumi')} {s.earthElevMin}° … {s.earthElevMax}°
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">
                {s.tempMin} °C {t('to', 's.d.')} {s.tempMax} °C
              </td>
              <td className="px-4 py-3">
                <IceBadge site={s} />
              </td>
              <td className="px-4 py-3 font-mono text-sm font-bold text-white">
                {totalScore(s)}/{MAX_TOTAL}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NavigationData({ activeId, onSelect: setActiveId }: { activeId: string; onSelect: (id: string) => void }) {
  const { t } = useLocale();
  const [view, setView] = useState<'kartu' | 'tabel'>('kartu');
  const active = SITES.find((s) => s.id === activeId) ?? SITES[0];

  return (
    <section id="data" className="scroll-mt-20 border-t border-white/10 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">{t('Official NASA Navigation Data & Controls', 'Kontrol & Data Navigasi Resmi NASA')}</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">{t('Compare landing sites: south pole vs Apollo', 'Perbandingan lokasi pendaratan: kutub selatan vs Apollo')}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-300">
          {t(
            'Compare the south pole with the historic Apollo sites. Each site shows its lighting (permanent shadow vs sunlight), the Sun angle available for solar power, the direct line-of-sight window to Earth, temperature, resources and a 0–5 rating per criterion. This data is tested in the quiz below.',
            'Bandingkan kawasan kutub selatan dengan situs historis Apollo. Setiap lokasi menampilkan kondisi pencahayaan (bayangan abadi vs sinar Matahari), sudut Matahari untuk pembangkitan daya surya, jendela komunikasi garis pandang langsung ke Bumi, suhu, sumber daya, dan nilai 0–5 per kriteria. Data ini diuji pada kuis di bawah.'
          )}
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label={t('Choose a site', 'Pilih lokasi')} className="flex gap-2 overflow-x-auto pb-1">
            {SITES.map((s) => (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={s.id === activeId}
                onClick={() => {
                  setActiveId(s.id);
                  setView('kartu');
                }}
                className={`glow-btn shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                  s.id === activeId
                    ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                    : 'border-white/15 bg-white/[0.04] text-slate-200 backdrop-blur-md hover:border-cyan-300/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {s.short}
                
              </button>
            ))}
          </div>
          <div className="flex shrink-0 rounded-full border border-white/15 bg-white/[0.04] p-1 text-sm font-semibold backdrop-blur-md">
            <button
              type="button"
              onClick={() => setView('kartu')}
              aria-pressed={view === 'kartu'}
              className={`glow-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${view === 'kartu' ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" /> {t('Cards', 'Kartu')}
            </button>
            <button
              type="button"
              onClick={() => setView('tabel')}
              aria-pressed={view === 'tabel'}
              className={`glow-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${view === 'tabel' ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <Table2 className="h-4 w-4" aria-hidden="true" /> {t('Table', 'Tabel')}
            </button>
          </div>
        </div>

        <div className="mt-6">
          {view === 'kartu' ? (
            <SiteDetail site={active} />
          ) : (
            <ComparisonTable
              onSelect={(id) => {
                setActiveId(id);
                setView('kartu');
              }}
            />
          )}
        </div>

        <div className="mt-6">
          <SunEarthChart activeId={activeId} onSelect={setActiveId} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <TemperatureChart activeId={activeId} onSelect={setActiveId} />
          <SiteMap activeId={activeId} onSelect={setActiveId} />
        </div>

        <div className="mt-6">
          <Ranking activeId={activeId} onSelect={setActiveId} />
        </div>

        <Glossary />
      </div>
    </section>
  );
}
