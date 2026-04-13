import { useState, useEffect } from "react";
import Landing          from "./pages/Landing.jsx";
import Dashboard        from "./pages/Dashboard.jsx";
import LegalDisclaimer  from "./components/LegalDisclaimer.jsx";

export default function App() {
  const [page,            setPage]            = useState("landing");
  const [disclaimerDone,  setDisclaimerDone]  = useState(false);

  // Check if user already accepted in this session
  useEffect(() => {
    const accepted = sessionStorage.getItem("nexguard_disclaimer_accepted");
    if (accepted === "true") setDisclaimerDone(true);
  }, []);

  // Show disclaimer first — blocks everything until accepted
  if (!disclaimerDone) {
    return (
      <>
        <div className="scanlines" />
        <LegalDisclaimer onAccept={() => setDisclaimerDone(true)} />
      </>
    );
  }

  return (
    <>
      <div className="scanlines" />
      {page === "landing"   && <Landing   onEnter={() => setPage("dashboard")} />}
      {page === "dashboard" && <Dashboard onHome={() => setPage("landing")} />}
    </>
  );
}
