import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type DepotFull, LoadingState, ErrorState, StatDepotTable, PageShell } from "./StatistiquesShared";

const YEARS = [2024, 2025, 2026, 2027];

const RegistreAnnuelPage = () => {
  const navigate = useNavigate();
  const [allDepots, setAllDepots] = useState<DepotFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    fetch("http://localhost:5000/depots", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error("Erreur serveur"); return r.json(); })
      .then((data) => { setAllDepots(data); setLoading(false); })
      .catch((e) => { setError(e.message || "Erreur de chargement"); setLoading(false); });
  }, [navigate]);

  const filtered = allDepots.filter((d) => new Date(d.dateDepot).getFullYear() === year);

  return (
    <PageShell title="Registre annuel — السجل السنوي" backTo="/statistiques">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Année :</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input-field w-auto"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState msg={error} /> : <StatDepotTable depots={filtered} />}
    </PageShell>
  );
};

export default RegistreAnnuelPage;
