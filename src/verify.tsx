import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import VerifyPage from './pages/VerifyPage.tsx';
import { installTranslateGuard } from './lib/translateGuard';
import './index.css';

// Shows a friendly recovery screen instead of a blank page if anything on the
// verification page throws while rendering.
class VerifyErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Verify page crashed', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const isId = document.documentElement.lang === 'id';
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-200">
        <div>
          <p className="text-lg font-bold">
            {isId ? 'Halaman verifikasi gagal dimuat.' : 'The verification page could not load.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-sky-400 px-6 py-3 font-bold text-slate-950 hover:bg-sky-300"
          >
            {isId ? 'Muat ulang' : 'Reload'}
          </button>
        </div>
      </div>
    );
  }
}

installTranslateGuard();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <VerifyErrorBoundary>
        <VerifyPage />
      </VerifyErrorBoundary>
    </StrictMode>
  );
  (window as Window & { __verifyMounted?: boolean }).__verifyMounted = true;
}
