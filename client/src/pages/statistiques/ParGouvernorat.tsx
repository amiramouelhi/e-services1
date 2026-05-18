import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type DepotFull,
  LoadingState,
  ErrorState,
  EmptyState,
  StatDepotTable,
  GroupSection,
  PageShell,
} from "./StatistiquesShared";
import { GOUVERNORATS_DATA } from "../../types/gouvernoratsData";

const ParGouvernoratPage = () => {
  const navigate = useNavigate();
  const [allDepots, setAllDepots] = useState<DepotFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"all" | "specific">("all");
  const [selectedGov, setSelectedGov] = useState(GOUVERNORATS_DATA[0]?.fr ?? "");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    fetch(`${import.meta.env.VITE_API_URL}/depots`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setAllDepots(data); setLoading(false); })
      .catch(() => { setError("Erreur de chargement"); setLoading(false); });
  }, [navigate]);

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState msg={error} />;
    if (mode === "specific") {
      const filtered = allDepots.filter((d) => d.deposant.gouvernorat === selectedGov);
      return <StatDepotTable depots={filtered} />;
    }
    const groups = new Map<string, DepotFull[]>();
    for (const d of allDepots) {
      const key = d.deposant.gouvernorat || "Non spécifié";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }
    if (groups.size === 0) return <EmptyState />;
    return Array.from(groups.entries()).map(([title, deps]) => (
      <GroupSection key={title} title={title} depots={deps} />
    ));
  };

  return (
    <PageShell title="Dépôt / Gouvernorat — الإيداع حسب الولاية" backTo="/statistiques">
      <div className="paper-form p-4 mb-4">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === "all"} onChange={() => setMode("all")} className="accent-primary" />
            <span className="text-sm font-medium">Tous les gouvernorats</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === "specific"} onChange={() => setMode("specific")} className="accent-primary" />
            <span className="text-sm font-medium">Gouvernorat spécifique</span>
          </label>
        </div>
        {mode === "specific" && (
          <div className="mt-3">
            <select
              value={selectedGov}
              onChange={(e) => setSelectedGov(e.target.value)}
              className="input-field w-auto"
            >
              {GOUVERNORATS_DATA.map((g) => (
                <option key={g.fr} value={g.fr}>{g.fr} — {g.ar}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {renderContent()}
    </PageShell>
  );
};

export default ParGouvernoratPage;
