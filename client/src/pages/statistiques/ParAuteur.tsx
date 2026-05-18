import { useEffect, useState } from "react";
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

const ParAuteurPage = () => {
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
    fetch(`${import.meta.env.VITE_API_URL}/depots`, { headers: { Authorization: `Bearer ${token}` } })
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
    fetch(`${import.meta.env.VITE_API_URL}/depots/search?q=${encodeURIComponent(query)}&fields=${selectedField}`, {
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
      const names = d.auteurs.map((a) => a.auteur.nomComplet_fr || a.auteur.nomComplet_ar || "—");
      const unique = [...new Set(names)];
      for (const name of unique) {
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name)!.push(d);
      }
    }
    if (groups.size === 0) return <EmptyState />;
    return Array.from(groups.entries()).map(([title, deps]) => (
      <GroupSection key={title} title={title} depots={deps} />
    ));
  };

  return (
    <PageShell title="Dépôt / Auteurs — الإيداع حسب المؤلف" backTo="/statistiques">
      <div className="paper-form p-4 mb-4">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={mode === "all"}
              onChange={() => { setMode("all"); setSearched(false); }}
              className="accent-primary"
            />
            <span className="text-sm font-medium">Tous les auteurs</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === "specific"} onChange={() => setMode("specific")} className="accent-primary" />
            <span className="text-sm font-medium">Auteur spécifique</span>
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

export default ParAuteurPage;
