import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, ArrowLeft, Search } from 'lucide-react';
import StarField from '@/components/StarField';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { useLocale } from '@/i18n/useLocale';
import { UI } from '@/i18n/ui';
import { verifyCertificate, type CertificateRecord } from '@/lib/certificateDb';

type VerifyState = 'idle' | 'checking' | 'valid' | 'invalid' | 'error';

export default function VerifyPage() {
  return (
    <LocaleProvider>
        <div className="relative min-h-screen overflow-x-hidden">
          <StarField />
          <div className="relative z-10">
            <Header />
            <main>
              <VerifyContent />
            </main>
            <Footer />
          </div>
        </div>
    </LocaleProvider>
  );
}

function VerifyContent() {
  const { locale, tr } = useLocale();
  const [inputId, setInputId] = useState('');
  const [state, setState] = useState<VerifyState>('idle');
  const [record, setRecord] = useState<CertificateRecord | null>(null);

  const requestRef = useRef(0);

  useEffect(() => {
    const id = readIdFromUrl();
    if (id) {
      setInputId(id);
      checkId(id);
    }
  }, []);

  async function checkId(id: string) {
    const clean = id.trim();
    if (!clean) return;
    // Only the latest request may update the screen, so a slow earlier
    // response can never overwrite a newer result.
    const requestId = ++requestRef.current;
    setState('checking');
    setRecord(null);
    try {
      const result = await verifyCertificate(clean);
      if (requestId !== requestRef.current) return;
      if (result && result.id) {
        setRecord(result);
        setState('valid');
      } else {
        setState('invalid');
      }
    } catch {
      if (requestId !== requestRef.current) return;
      setState('error');
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    checkId(inputId);
  }

  function handleRetry() {
    checkId(inputId);
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';
    try {
      return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20 ring-1 ring-sky-400/50">
            <ShieldCheck className="h-8 w-8 text-sky-300" aria-hidden="true" />
          </div>
          <h1 className="font-display mt-6 text-3xl font-semibold leading-[1.2] text-white sm:text-4xl">
            {tr(UI.verifyHeading)}
          </h1>
          <p className="mt-3 leading-normal text-slate-300">{tr(UI.verifyBody)}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-3 glass rounded-2xl p-5 sm:flex-row"
        >
          <input
            type="text"
            value={inputId}
            onChange={(event) => setInputId(event.target.value)}
            placeholder={tr(UI.verifyPlaceholder)}
            className="flex-1 rounded-full border border-white/15 bg-slate-950/50 px-5 py-3 backdrop-blur-md text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-400/30"
          />
          <button
            type="submit"
            disabled={!inputId.trim() || state === 'checking'}
            className="inline-flex items-center justify-center gap-2 glow-btn rounded-full bg-sky-400 px-6 py-3 font-bold text-slate-950 hover:-translate-y-0.5 hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {state === 'checking' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {tr(UI.verifyChecking)}
              </>
            ) : (
              <>
                <Search className="h-4 w-4" aria-hidden="true" />
                {tr(UI.verifyButton)}
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          {state === 'valid' && record && (
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-6 backdrop-blur-md sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/30 ring-1 ring-emerald-400/60">
                  <CheckCircle2 className="h-7 w-7 text-emerald-300" aria-hidden="true" />
                </div>
                <p className="mt-4 text-xl font-bold text-emerald-200 sm:text-2xl">
                  {tr(UI.verifyValid)}
                </p>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoRow label={tr(UI.verifyNameLabel)} value={record.recipient_name || '—'} />
                <InfoRow label={tr(UI.verifyCountryLabel)} value={record.country || '—'} />
                <InfoRow label={tr(UI.verifyQuizLabel)} value={record.quiz_name || '—'} />
                <InfoRow label={tr(UI.verifyScoreLabel)} value={record.score_text || '—'} />
                <InfoRow label={tr(UI.verifyDateLabel)} value={formatDate(record.issued_at)} />
                <InfoRow label={tr(UI.verifyIdLabel)} value={record.id} />
              </dl>
              <p className="mt-6 text-center text-xs italic leading-relaxed text-slate-400/80">
                {tr(UI.verifyDisclaimer)}
              </p>
            </div>
          )}

          {state === 'invalid' && (
            <div className="flex flex-col items-center rounded-2xl border border-rose-400/40 bg-rose-500/15 p-8 backdrop-blur-md text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/30 ring-1 ring-rose-400/60">
                <XCircle className="h-7 w-7 text-rose-300" aria-hidden="true" />
              </div>
              <p className="mt-4 text-lg font-bold text-rose-200">{tr(UI.verifyInvalid)}</p>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center rounded-2xl border border-amber-400/40 bg-amber-500/15 p-8 backdrop-blur-md text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/30 ring-1 ring-amber-400/60">
                <XCircle className="h-7 w-7 text-amber-300" aria-hidden="true" />
              </div>
              <p className="mt-4 text-lg font-bold text-amber-200">{tr(UI.verifyError)}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 rounded-full border border-amber-300/50 px-5 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-500/20"
              >
                {locale === 'id' ? 'Coba lagi' : 'Try again'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            onClick={backToHome}
            className="inline-flex items-center gap-2 glow-btn rounded-full border border-white/15 bg-white/[0.05] px-6 py-3 font-bold text-slate-200 backdrop-blur-md hover:-translate-y-0.5 hover:border-sky-400/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {tr(UI.verifyBackHome)}
          </a>
        </div>
      </div>
    </section>
  );
}

// Coming from the home page in the same tab, go back in history so the visitor
// returns to the spot they left (the home page restores its scroll position).
function backToHome(event: MouseEvent<HTMLAnchorElement>) {
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === window.location.origin && ref.pathname === '/' && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  } catch {
    /* fall back to the normal link */
  }
}

// Accepts both /verify?id=ARIJU-001 and /verify/ARIJU-001 (some QR scanners
// and chat apps rewrite links into the path form).
function readIdFromUrl() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('id');
    if (fromQuery && fromQuery.trim()) return fromQuery.trim();
    const match = window.location.pathname.match(/\/verify(?:\.html)?\/([^/?#]+)/i);
    return match ? decodeURIComponent(match[1]).trim() : '';
  } catch {
    return '';
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-soft glow-hover rounded-xl px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-white">{value}</dd>
    </div>
  );
}
