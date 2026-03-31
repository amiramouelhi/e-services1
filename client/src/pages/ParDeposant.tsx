import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type DepotFull,
  LoadingState,
  ErrorState,
  EmptyState,
  StatDepotTable,
  GroupSection,
  SearchPanel,
  PageShell,
} from "./StatistiquesShared";

const ParDeposantPage = () => {
  const navigate = useNavigate();
  const [allDepots, setAllDepots] = useState<DepotFull[]>([]);
  const [searchResults, setSearchResults] = useState<DepotFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"all" | "specific">("all");
  const [selectedField, setSelectedField] = useState("");
  const [query, setQuery] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [inputError, setInputError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    fetch("http://localhost:5000/depots", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setAllDepots(data); setLoading(false); })
      .catch(() => { setError("Erreur de chargement"); setLoading(false); });
  }, [navigate]);

  const handleSearch = () => {
    setFieldError("");
    setInputError("");
    setSearchError("");
    if (!selectedField) { setFieldError("Veuillez sélectionner un champ."); return; }
    if (!query.trim()) { setInputError("Veuillez saisir une valeur."); return; }
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    setSearchLoading(true);
    fetch(`http://localhost:5000/depots/search?q=${encodeURIComponent(query)}&fields=${selectedField}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setSearchResults(Array.isArray(data) ? data : []); setSearched(true); setSearchLoading(false); })
      .catch(() => { setSearchError("Erreur lors de la recherche."); setSearchLoading(false); });
  };

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState msg={error} />;
    if (mode === "specific") {
      if (!searched) return null;
      if (searchLoading) return <LoadingState />;
      return <StatDepotTable depots={searchResults} />;
    }
    const groups = new Map<string, DepotFull[]>();
    for (const d of allDepots) {
      const key = d.deposant.nomComplet_fr || d.deposant.nomComplet_ar || d.deposant.raisonSociale || "—";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }
    if (groups.size === 0) return <EmptyState />;
    return Array.from(groups.entries()).map(([title, deps]) => (
      <GroupSection key={title} title={title} depots={deps} />
    ));
  };

  return (
    <PageShell title="Dépôt / Déposant — الإيداع حسب المودع" backTo="/statistiques">
      <div className="paper-form p-4 mb-4">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={mode === "all"}
              onChange={() => { setMode("all"); setSearched(false); }}
              className="accent-primary"
            />
            <span className="text-sm font-medium">Tous les déposants</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === "specific"} onChange={() => setMode("specific")} className="accent-primary" />
            <span className="text-sm font-medium">Déposant spécifique</span>
          </label>
        </div>
      </div>
      {mode === "specific" && (
        <SearchPanel
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          loading={searchLoading}
          fieldError={fieldError}
          inputError={inputError}
          searchError={searchError}
        />
      )}
      {renderContent()}
    </PageShell>
  );
};

export default ParDeposantPage;
