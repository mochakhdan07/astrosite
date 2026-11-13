import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Award, Check, Copy, Download, FileText, ImageIcon, Loader2, Lock } from 'lucide-react';
import { certificateToPdf, certificateToPng, renderCertificate, type CertificateText } from '@/lib/certificate';
import { issueCertificate, type CertificateRecord } from '@/lib/certificateDb';
import { PASS_SCORE } from '@/lib/lunarData';
import { useLocale } from '@/i18n/useLocale';
import type { Locale } from '@/i18n/locale';

const QUIZ_NAME = 'AstroSite – Lunar Landing Site Navigator';
const PREVIEW_ID = 'ARIJU-XXX';

const SHARED = {
  org: 'ARIJU-VII EDUCATION PROGRAM',
  signerName: 'M. Akhdan Rifqi Junnawwar',
  signerTitle: 'Founder & Project Designer of ARIJU-VII',
  stamp: 'ASTROSITE • LUNAR LANDING SITE NAVIGATOR •',
};

// The certificate is printed in the language chosen on the site.
const TEXT: Record<Locale, CertificateText> = {
  en: {
    ...SHARED,
    heading: 'Certificate of Completion',
    presented: 'Proudly presented to',
    body: 'has passed the "AstroSite: Lunar Landing Site Navigator" Navigation Quiz based on official NASA data.',
    date: 'Date',
    certIdLabel: 'Certificate No.',
  },
  id: {
    ...SHARED,
    heading: 'Sertifikat Penyelesaian',
    presented: 'Diberikan dengan bangga kepada',
    body: 'Telah lulus Kuis Uji Navigasi "AstroSite: Lunar Landing Site Navigator" berbasis data resmi NASA.',
    date: 'Tanggal',
    certIdLabel: 'No. Sertifikat',
  },
};

function formatDate(date: Date, locale: Locale) {
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function cleanName(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function safeFileName(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'peserta';
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in Safari/Firefox.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

type Issued = { record: CertificateRecord; pdf: Blob; png: Blob; url: string; baseName: string };

type Props = { result: { score: number; total: number } | null };

export default function CertificateGenerator({ result }: Props) {
  const { t } = useLocale();
  const passed = !!result && result.score >= PASS_SCORE;

  return (
    <section id="sertifikat" className="scroll-mt-20 border-t border-white/10 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-widest text-amber-300">{t('Digital Certificate Generator', 'Generator Sertifikat Digital')}</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">{t('Your certificate of completion', 'Sertifikat penyelesaian Anda')}</h2>
        {passed && result ? (
          <Generator score={result.score} total={result.total} />
        ) : (
          <div className="mt-8 flex flex-col items-center glass rounded-3xl !border-dashed p-10 text-center">
            <Lock className="h-10 w-10 text-slate-500" aria-hidden="true" />
            <p className="mt-4 max-w-md text-slate-300">
              {result
                ? t(
                    `Your score is ${result.score}/${result.total}. At least ${PASS_SCORE} correct answers are needed to unlock the certificate.`,
                    `Skor Anda ${result.score}/${result.total}. Minimal ${PASS_SCORE} jawaban benar diperlukan untuk membuka sertifikat.`
                  )
                : t(
                    `Finish the quiz with at least ${PASS_SCORE} correct answers to unlock the certificate generator.`,
                    `Selesaikan kuis dengan minimal ${PASS_SCORE} jawaban benar untuk membuka generator sertifikat.`
                  )}
            </p>
            <a href="#kuis" className="mt-5 glow-btn rounded-full bg-cyan-400 px-6 py-2.5 font-bold text-slate-950 hover:-translate-y-0.5 hover:bg-cyan-300">
              {result ? t('Retake Quiz', 'Ulangi Kuis') : t('Go to Quiz', 'Ke Kuis')}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function Generator({ score, total }: { score: number; total: number }) {
  const { locale, t } = useLocale();
  const text = TEXT[locale];
  const [name, setName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [issued, setIssued] = useState<Issued | null>(null);
  const [copied, setCopied] = useState(false);
  const urlsRef = useRef<string[]>([]);

  const trimmed = cleanName(name);

  useEffect(
    () => () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    []
  );

  // Live, low-resolution preview that follows the typed name.
  useEffect(() => {
    if (issued) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setRendering(true);
      try {
        const canvas = await renderCertificate({
          name: trimmed || (locale === 'id' ? 'Nama Lengkap Anda' : 'Your Full Name'),
          dateText: formatDate(new Date(), locale),
          certificateId: PREVIEW_ID,
          verifyUrl: `${window.location.origin}/verify`,
          text,
          scale: 0.6,
        });
        const blob = await certificateToPng(canvas);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
      } catch (err) {
        console.warn('Preview failed', err);
      } finally {
        if (!cancelled) setRendering(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed, issued, text, locale]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (issued) {
      downloadBlob(issued.pdf, `${issued.baseName}.pdf`);
      return;
    }
    if (!trimmed) return;
    setBusy(true);
    setError(false);
    try {
      // Reserve the official certificate number, then print it with the name.
      const record = await issueCertificate({ recipientName: trimmed, quizName: QUIZ_NAME, score, total });
      const canvas = await renderCertificate({
        name: record.recipient_name,
        dateText: formatDate(new Date(record.issued_at), locale),
        certificateId: record.id,
        verifyUrl: `${window.location.origin}/verify?id=${encodeURIComponent(record.id)}`,
        text,
      });
      const png = await certificateToPng(canvas);
      const pdf = await certificateToPdf(canvas, {
        title: `${text.heading} – ${QUIZ_NAME}`,
        recipient: record.recipient_name,
        certificateId: record.id,
      });
      canvas.width = 0;
      canvas.height = 0;
      const url = URL.createObjectURL(png);
      urlsRef.current.push(url);
      const baseName = `${locale === 'id' ? 'sertifikat' : 'certificate'}-${record.id.toLowerCase()}-${safeFileName(record.recipient_name)}`;
      setIssued({ record, pdf, png, url, baseName });
      downloadBlob(pdf, `${baseName}.pdf`);
    } catch (err) {
      console.error('Certificate download failed', err);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  const verifyUrl = issued ? `${window.location.origin}/verify?id=${encodeURIComponent(issued.record.id)}` : '';

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t('Copy this link:', 'Salin tautan ini:'), verifyUrl);
    }
  }

  const shownUrl = issued?.url ?? previewUrl;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <form onSubmit={handleSubmit} className="glass rounded-3xl !border-amber-300/30 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-amber-300" aria-hidden="true" />
          <p className="font-semibold text-emerald-300">
            {t(`Passed with a score of ${score}/${total}`, `Lulus dengan skor ${score}/${total}`)}
          </p>
        </div>
        {!issued ? (
          <>
            <label htmlFor="cert-name" className="mt-6 block text-sm font-semibold text-slate-200">
              {t('Full Name', 'Nama Lengkap')}
            </label>
            <input
              id="cert-name"
              type="text"
              value={name}
              maxLength={40}
              autoComplete="name"
              disabled={busy}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('Type your full name', 'Tulis nama lengkap Anda')}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/50 px-4 py-3 backdrop-blur-md text-slate-100 placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-300/20 disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-slate-400">
              {t(
                'The name is printed exactly as typed and is locked once the certificate is issued.',
                'Nama dicetak persis seperti yang ditulis dan dikunci setelah sertifikat diterbitkan.'
              )}
            </p>
            <button
              type="submit"
              disabled={!trimmed || busy}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 glow-btn glow-btn-amber rounded-full bg-amber-300 px-6 py-3 font-bold text-slate-950 hover:-translate-y-0.5 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t('Preparing certificate…', 'Menyiapkan sertifikat…')}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" aria-hidden="true" /> {t('Download Certificate (PDF)', 'Unduh Sertifikat (PDF)')}
                </>
              )}
            </button>
            {error && (
              <p role="alert" className="mt-3 text-sm font-semibold text-rose-300">
                {t(
                  'The certificate could not be created. Check your internet connection and try again.',
                  'Sertifikat gagal dibuat. Periksa koneksi internet lalu coba lagi.'
                )}
              </p>
            )}
          </>
        ) : (
          <div className="mt-6 space-y-4" aria-live="polite">
            <p className="text-sm text-slate-300">
              {t('Certificate for', 'Sertifikat untuk')}{' '}
              <span className="font-semibold text-white">{issued.record.recipient_name}</span>{' '}
              {t('was issued successfully.', 'berhasil diterbitkan.')}
            </p>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 glow-btn glow-btn-amber rounded-full bg-amber-300 px-6 py-3 font-bold text-slate-950 hover:-translate-y-0.5 hover:bg-amber-200"
            >
              <FileText className="h-4 w-4" aria-hidden="true" /> {t('Download PDF', 'Unduh PDF')}
            </button>
            <button
              type="button"
              onClick={() => downloadBlob(issued.png, `${issued.baseName}.png`)}
              className="inline-flex w-full items-center justify-center gap-2 glow-btn glow-btn-amber rounded-full border border-amber-300/60 px-6 py-3 font-bold text-amber-200 hover:-translate-y-0.5 hover:bg-amber-300/10"
            >
              <ImageIcon className="h-4 w-4" aria-hidden="true" /> {t('Download PNG', 'Unduh PNG')}
            </button>
            <div className="glass-soft rounded-xl !border-cyan-400/30 !bg-cyan-950/30 p-4 text-sm">
              <p className="text-slate-300">
                {t('Certificate No.', 'No. Sertifikat')}: <span className="font-mono font-bold text-white">{issued.record.id}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-300 underline">
                  {t('Verification page', 'Halaman verifikasi')}
                </a>
                <button type="button" onClick={copyLink} className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t('Copied', 'Tersalin') : t('Copy link', 'Salin tautan')}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      <figure>
        <div className="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-white shadow-2xl shadow-black/50">
          {shownUrl ? (
            <img src={shownUrl} alt={t(`Certificate preview for ${trimmed || 'participant'}`, `Pratinjau sertifikat untuk ${trimmed || 'peserta'}`)} className="block w-full" />
          ) : (
            <div className="flex aspect-[1600/1131] items-center justify-center text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            </div>
          )}
          {rendering && shownUrl && !issued && (
            <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-slate-500" aria-hidden="true" />
          )}
        </div>
        <figcaption className="mt-3 text-center text-xs text-slate-400">
          {issued
            ? t('Official certificate with a unique number and verification QR code.', 'Sertifikat resmi dengan nomor unik dan kode QR verifikasi.')
            : t('Live preview – the official certificate number is assigned when you download.', 'Pratinjau langsung – nomor sertifikat resmi diberikan saat diunduh.')}
        </figcaption>
      </figure>
    </div>
  );
}
