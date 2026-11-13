import { useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { useLocale } from '@/i18n/useLocale';
import { PASS_SCORE, pickQuizQuestions } from '@/lib/lunarData';

type QuizProps = {
  onFinish: (score: number, total: number) => void;
  onRestart: () => void;
};

export default function Quiz({ onFinish, onRestart }: QuizProps) {
  const { t, tr } = useLocale();
  // A fresh random set of questions (with shuffled options) on every page load.
  const [questions, setQuestions] = useState(() => pickQuizQuestions());
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const answered = selected !== null;
  const progress = Math.round(((index + (answered ? 1 : 0)) / total) * 100);
  const passed = score >= PASS_SCORE;

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    if (i === question.answerIndex) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= total) {
      setFinished(true);
      onFinish(score, total);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function restart() {
    setQuestions(pickQuizQuestions());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    onRestart();
  }

  function optionClass(i: number) {
    const base =
      'glow-btn flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left font-semibold leading-snug focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40';
    if (!answered) return `${base} border-white/15 bg-white/[0.05] text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-300/[0.08] hover:text-white`;
    if (i === question.answerIndex) return `${base} border-emerald-400 bg-emerald-500/15 text-emerald-50`;
    if (i === selected) return `${base} border-rose-400 bg-rose-500/15 text-rose-50`;
    return `${base} border-white/10 bg-white/[0.02] text-slate-400`;
  }

  return (
    <section id="kuis" className="scroll-mt-20 border-t border-white/10 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">{t('Interactive Navigation Quiz', 'Kuis Uji Navigasi Interaktif')}</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">{t('Test your navigation knowledge', 'Uji pemahaman data navigasi')}</h2>
        <p className="mt-3 leading-relaxed text-slate-300">
          {t(
            `${total} multiple-choice questions based on the data above. Answer at least ${PASS_SCORE} of ${total} correctly to unlock the digital certificate.`,
            `${total} soal pilihan ganda berdasarkan data di atas. Jawab minimal ${PASS_SCORE} dari ${total} soal dengan benar untuk membuka sertifikat digital.`
          )}
        </p>

        <div className="glass mt-8 rounded-3xl p-6 sm:p-8">
          {finished ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ring-1 ${
                  passed ? 'bg-amber-300/20 ring-amber-300/50' : 'bg-slate-700/40 ring-white/20'
                }`}
              >
                <Trophy className={`h-10 w-10 ${passed ? 'text-amber-300' : 'text-slate-400'}`} aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm font-bold uppercase tracking-widest text-slate-400">{t('Final score', 'Skor akhir')}</p>
              <p className="font-display text-5xl font-semibold text-white">
                {score} / {total}
              </p>
              <p className="mt-1 text-slate-400">{Math.round((score / total) * 100)}%</p>
              <p className={`mt-4 max-w-md text-lg font-semibold ${passed ? 'text-emerald-300' : 'text-amber-200'}`}>
                {passed
                  ? t('Congratulations, you passed! Continue to the certificate section below.', 'Selamat, Anda lulus! Lanjutkan ke bagian sertifikat di bawah.')
                  : t(
                      `Not passed yet. At least ${PASS_SCORE} correct answers are needed – review the data and try again.`,
                      `Belum lulus. Dibutuhkan minimal ${PASS_SCORE} jawaban benar – pelajari lagi datanya lalu coba ulang.`
                    )}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {passed && (
                  <a
                    href="#sertifikat"
                    className="inline-flex items-center justify-center gap-2 glow-btn glow-btn-amber rounded-full bg-amber-300 px-6 py-3 font-bold text-slate-950 hover:-translate-y-0.5 hover:bg-amber-200"
                  >
                    {t('Create Certificate', 'Buat Sertifikat')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center justify-center gap-2 glow-btn rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 font-bold text-white backdrop-blur-md hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t('Retake Quiz', 'Ulangi Kuis')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-300">
                <span>{t(`Question ${index + 1} of ${total}`, `Soal ${index + 1} dari ${total}`)}</span>
                <span className="text-amber-200">
                  {t('Score', 'Skor')}: {score}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-300 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <h3 className="font-display mt-7 text-xl font-semibold leading-snug text-white sm:text-2xl">
                {tr(question.question)}
              </h3>
              <div className="mt-6 grid gap-3">
                {question.options.map((option, i) => (
                  <button key={`${index}-${option.en}`} type="button" onClick={() => choose(i)} disabled={answered} className={optionClass(i)}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{tr(option)}</span>
                    {answered && i === question.answerIndex && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                    )}
                    {answered && i === selected && i !== question.answerIndex && (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-300" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
              {answered && (
                <div role="status" className="glass-soft mt-6 rounded-2xl p-5">
                  <p className={`font-bold ${selected === question.answerIndex ? 'text-emerald-300' : 'text-amber-200'}`}>
                    {selected === question.answerIndex
                      ? t('Correct!', 'Benar!')
                      : `${t('Not quite. Correct answer:', 'Kurang tepat. Jawaban benar:')} ${tr(question.options[question.answerIndex])}`}
                  </p>
                  <p className="mt-2 leading-relaxed text-slate-300">{tr(question.explanation)}</p>
                  <button
                    type="button"
                    onClick={next}
                    className="mt-5 inline-flex items-center gap-2 glow-btn rounded-full bg-white px-5 py-2.5 font-bold text-slate-950 hover:-translate-y-0.5 hover:bg-cyan-100"
                  >
                    {index + 1 >= total ? t('See Score', 'Lihat Skor') : t('Next Question', 'Soal Berikutnya')}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
