import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center gradient-surface">
          <p className="text-4xl mb-4">😅</p>
          <h2 className="text-xl font-bold text-foreground mb-2">Oups, quelque chose a planté</h2>
          <p className="text-sm text-muted-foreground mb-6">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
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
