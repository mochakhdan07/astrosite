import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; name: string };
type State = { failed: boolean; attempt: number };

/**
 * Keeps one broken section from taking the whole page down with it (which
 * shows up as an empty black screen). The failed section shows a small
 * "try again" card instead and everything else keeps working.
 */
export default class SectionBoundary extends Component<Props, State> {
  state: State = { failed: false, attempt: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`Section "${this.props.name}" crashed`, error, info.componentStack);
  }

  private retry = () => this.setState((s) => ({ failed: false, attempt: s.attempt + 1 }));

  render() {
    if (!this.state.failed) return <div key={this.state.attempt}>{this.props.children}</div>;
    const isId = document.documentElement.lang === 'id';
    return (
      <div className="mx-auto my-10 max-w-xl glass rounded-2xl p-6 text-center text-slate-200">
        <p className="font-bold">
          <span>{isId ? 'Bagian ini gagal dimuat.' : 'This section could not load.'}</span>
        </p>
        <button
          type="button"
          onClick={this.retry}
          className="mt-4 rounded-full bg-sky-400 px-5 py-2 font-bold text-slate-950 hover:bg-sky-300"
        >
          <span>{isId ? 'Coba lagi' : 'Try again'}</span>
        </button>
      </div>
    );
  }
}
