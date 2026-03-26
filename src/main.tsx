import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

// ── Chunk preload error recovery ──
// When Vite can't fetch a dynamic chunk (stale SW, deploy mismatch),
// do ONE controlled reload. sessionStorage flag prevents infinite loop.
const RELOAD_KEY = "malaky-chunk-reload";

window.addEventListener("vite:preloadError", (e) => {
  e.preventDefault();
  if (!sessionStorage.getItem(RELOAD_KEY)) {
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
  }
});

// Clear the flag on successful load
sessionStorage.removeItem(RELOAD_KEY);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
