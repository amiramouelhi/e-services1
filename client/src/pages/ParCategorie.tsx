import React, { useEffect, useState } from "react";
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

interface Categorie {
  id: number;
  code: string;
  nom_fr: string;
  nom_ar: string;
}

const ParCategoriePage = () => {
  const navigate = useNavigate();
  const [allDepots, setAllDepots] = useState<DepotFull[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"all" | "specific">("all");
  const [selectedCat, setSelectedCat] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    Promise.all([
      fetch("http://localhost:5000/depots", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("http://localhost:5000/categories", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([deps, cats]) => {
        setAllDepots(deps);
        setCategories(cats);
        if (cats.length > 0) setSelectedCat(String(cats[0].code));
        setLoading(false);
      })
      .catch(() => { setError("Erreur de chargement"); setLoading(false); });
  }, [navigate]);

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState msg={error} />;
    if (mode === "specific") {
      const filtered = allDepots.filter((d) => String(d.oeuvre.categorie.code) === selectedCat);
      return <StatDepotTable depots={filtered} />;
    }
    const groups = new Map<string, DepotFull[]>();
    for (const d of allDepots) {
      const key = `${d.oeuvre.categorie.code} - ${d.oeuvre.categorie.nom_fr}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }
    if (groups.size === 0) return <EmptyState />;
    return Array.from(groups.entries()).map(([title, deps]) => (
      <GroupSection key={title} title={title} depots={deps} />
    ));
  };

  return (
    <PageShell title="Liste dépôt par catégorie — قائمة الإيداع حسب الصنف" backTo="/statistiques">
      <div className="paper-form p-4 mb-4">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === "all"} onChange={() => setMode("all")} className="accent-primary" />
            <span className="text-sm font-medium">Toutes les catégories</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === "specific"} onChange={() => setMode("specific")} className="accent-primary" />
            <span className="text-sm font-medium">Catégorie spécifique</span>
          </label>
        </div>
        {mode === "specific" && (
          <div className="mt-3">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="input-field w-auto"
            >
              {categories.map((c) => (
                <option key={c.id} value={String(c.code)}>{c.code} - {c.nom_fr}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {renderContent()}
    </PageShell>
  );
};

export default ParCategoriePage;
