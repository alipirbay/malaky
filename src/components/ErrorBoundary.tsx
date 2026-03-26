import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

const RELOAD_KEY = "malaky-eb-reload";

function isChunkError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    msg.includes("dynamically imported module")
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // If it's a chunk loading error, attempt ONE controlled reload
    if (isChunkError(error) && !sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
      return;
    }
    // Clear for next session
    try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* ignore */ }

    // Log error for debugging
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center gradient-surface">
          <p className="text-4xl mb-4">😅</p>
          <h2 className="text-xl font-bold text-foreground mb-2">Oups, quelque chose a planté</h2>
          <p className="text-sm text-muted-foreground mb-6">{this.state.error?.message}</p>
          <button
            onClick={() => {
              try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* ignore */ }
              window.location.reload();
            }}
            className="gradient-primary rounded-xl px-6 py-3 font-semibold text-primary-foreground"
          >
            Recharger l'app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
