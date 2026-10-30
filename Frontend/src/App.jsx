import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Landing    from "./pages/Landing";
import Dashboard  from "./pages/Dashboard";
import LegalDisclaimer from "./components/LegalDisclaimer";

export default function App() {
  const [view,       setView]       = useState("landing");
  const [disclaimer, setDisclaimer] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("ng_disclaimer_v2");
    if (!accepted) setDisclaimer(true);
  }, []);

  const acceptDisclaimer = () => {
    localStorage.setItem("ng_disclaimer_v2", "true");
    setDisclaimer(false);
  };

  useEffect(() => {
    const handler = () => setView("landing");
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  return (
    <AuthProvider>
      {disclaimer && <LegalDisclaimer onAccept={acceptDisclaimer} />}
      {!disclaimer && (
        view === "landing"
          ? <Landing    onEnter={() => setView("dashboard")} />
          : <Dashboard  onHome={() => setView("landing")} />
      )}
    </AuthProvider>
  );
}