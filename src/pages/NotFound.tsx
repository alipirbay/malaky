import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-surface">
      <div className="text-center">
        <p className="text-6xl mb-4">😅</p>
        <h1 className="mb-2 text-4xl font-black text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">Cette page n'existe pas.</p>
        <a href="/" className="gradient-primary rounded-xl px-6 py-3 font-semibold text-primary-foreground">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
