import { useState } from "react";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      <div className="scanlines" />
      {page === "landing"   && <Landing   onEnter={() => setPage("dashboard")} />}
      {page === "dashboard" && <Dashboard onHome={() => setPage("landing")} />}
    </>
  );
}
