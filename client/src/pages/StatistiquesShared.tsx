import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type FacturePage from "./FacturePage";
import OtdavSidebar from "../components/OtdavSidebar";
interface statCards {
  ar: string;
  fr: string;
  path: string;
  locked?: boolean;
}
export interface DepotFull {
  id: number;
  numeroSequentiel: number | null;
  dateDepot: string;
  dateExpiration: string | null;
  statut: string;
  deposant: {
    nomComplet_fr: string | null;
    nomComplet_ar: string | null;
    raisonSociale: string | null;
    gouvernorat: string | null;
    cin: string | null;
    registreCommerce: string | null;
  };
  oeuvre: {
    titre_fr: string | null;
    titre_ar: string | null;
    categorie: { code: string | number; nom_fr: string; nom_ar: string };
  };
  auteurs: { auteur: { nomComplet_fr: string | null; nomComplet_ar: string | null } }[];
}

export const STATUT_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CERTIFIE: { label: "Certifié", bg: "bg-green-50", text: "text-green-700", border: "border-green-300" },
  EN_ATTENTE_RENOUVELLEMENT: { label: "Renouvellement requis", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
  EN_ATTENTE: { label: "En cours", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300" },
};

export const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const formatNumero = (depot: DepotFull): string => {
  if (!depot.numeroSequentiel) return "—";
  const d = new Date(depot.dateDepot);
  return `${depot.numeroSequentiel}-${depot.oeuvre.categorie.code}-${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

export const LoadingState = () => (
  <div className="paper-form px-6 py-16 flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
    <p className="text-sm text-muted-foreground">Chargement...</p>
  </div>
);

export const ErrorState = ({ msg }: { msg: string }) => (
  <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
    {msg}
  </div>
);

export const EmptyState = () => (
  <div className="paper-form px-6 py-16 flex flex-col items-center justify-center gap-3">
    <svg className="w-12 h-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-sm text-muted-foreground">Aucun dépôt trouvé</p>
  </div>
);

export const StatDepotTable = ({ depots }: { depots: DepotFull[] }) => {
  if (depots.length === 0) return <EmptyState />;
  return (
    <div className="paper-form overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="ltr">
          <thead>
            <tr style={{ background: "hsl(215 45% 97%)" }}>
              {["N° dépôt", "Déposant", "Titre oeuvre", "Catégorie", "Date dépôt", "Date expiration", "Statut"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {depots.map((depot) => {
              const cfg = STATUT_CONFIG[depot.statut] || { label: depot.statut, bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300" };
              return (
                <tr key={depot.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{formatNumero(depot)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{depot.deposant.nomComplet_fr || depot.deposant.nomComplet_ar || depot.deposant.raisonSociale || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{depot.oeuvre.titre_fr || depot.oeuvre.titre_ar || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{depot.oeuvre.categorie.code} - {depot.oeuvre.categorie.nom_fr}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(depot.dateDepot)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(depot.dateExpiration)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const GroupSection = ({ title, depots }: { title: string; depots: DepotFull[] }) => (
  <div className="mb-6">
    <div
      className="px-4 py-2 mb-2 rounded-md text-sm font-semibold"
      style={{ background: "hsl(215 45% 94%)", color: "hsl(215 60% 22%)" }}
    >
      {title} <span className="font-normal text-muted-foreground">({depots.length})</span>
    </div>
    <StatDepotTable depots={depots} />
  </div>
);

export const SearchPanel = ({
  selectedField,
  setSelectedField,
  query,
  setQuery,
  onSearch,
  loading,
  fieldError,
  inputError,
  searchError,
}: {
  selectedField: string;
  setSelectedField: (f: string) => void;
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  loading: boolean;
  fieldError: string;
  inputError: string;
  searchError: string;
}) => (
  <div className="paper-form p-4 mb-4 space-y-3">
    <div className="flex flex-wrap gap-4">
      {([{ key: "cin", label: "CIN" }, { key: "mf", label: "MF" }, { key: "rne", label: "RNE" }] as const).map(({ key, label }) => (
        <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selectedField === key}
            onChange={() => setSelectedField(selectedField === key ? "" : key)}
            className="accent-primary"
            style={{ width: "16px", height: "16px" }}
          />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </label>
      ))}
    </div>
    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
    <div className="flex gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
        placeholder="Saisir votre recherche..."
        className={`input-field flex-1 ${inputError ? "border-destructive" : ""}`}
        disabled={loading}
      />
      <button
        onClick={onSearch}
        disabled={loading}
        className="btn-primary flex items-center gap-2 px-5 disabled:opacity-60"
      >
        {loading
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        }
        Rechercher
      </button>
    </div>
    {inputError && <p className="text-xs text-destructive">{inputError}</p>}
    {searchError && <p className="text-xs text-destructive">{searchError}</p>}
  </div>
);

export const PageShell = ({ title, backTo, children }: { title: string; backTo: string; children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border/60" style={{ background: "hsl(215 60% 22%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <button
            onClick={() => navigate(backTo)}
            className="flex items-center gap-2 text-lg text-white/70 font-semibold hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
          <button
            onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); }}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Déconnexion
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </div>
    </div>
  );
};

const CardButton = ({ card, navigate }: { card: { ar: string; fr: string; path: string; locked?: boolean }; navigate: ReturnType<typeof useNavigate> }) => (
   <div className="relative">
    <button
      onClick={() => !card.locked && navigate(card.path)}
      className="group paper-form flex flex-col items-center justify-center gap-3 px-6 text-center
        w-[300px] h-[200px]
        hover:border-primary/30 hover:shadow-lg hover:scale-[1.03] transition-all duration-200
        active:scale-[0.98]"
      style={card.locked ? { filter: "blur(2px)", opacity: 0.5, pointerEvents: "none" } : undefined}
    >
      <span className="text-xl font-bold text-foreground leading-snug" dir="rtl">
        {card.ar}
      </span>
      <div className="w-10 h-0.5 bg-border" />
      <span className="text-sm font-semibold text-muted-foreground">
        {card.fr}
      </span>
    </button>
    {card.locked && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-4xl">🔒</span>
      </div>
    )}
  </div>
);    

const StatistiquesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  const cards: statCards[] = [
    { ar: "السجل العام", fr: "Registre général", path: "/statistiques/registre-general" },
    { ar: "السجل السنوي", fr: "Registre annuel", path: "/statistiques/registre-annuel" },
    { ar: "قائمة الإيداع حسب الصنف", fr: "Dépôts par catégorie", path: "/statistiques/par-categorie" },
    { ar: "الإيداع حسب المودع", fr: "Dépôts par déposant", path: "/statistiques/par-deposant" },
    { ar: "الإيداع حسب المؤلف", fr: "Dépôts par auteur", path: "/statistiques/par-auteur" },
    { ar: "الإيداع حسب الولاية", fr: "Dépôts par gouvernorat", path: "/statistiques/par-gouvernorat" },
  ];

  return (
    <div className="flex min-h-screen">
      <OtdavSidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-8">
        <div className="w-full max-w-3xl">
          <button
            onClick={() => navigate("/dashboard/depot")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-foreground tracking-tight">إحصائيات — Statistiques</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 justify-items-center gap-6">
            {cards.map((c) => (
              <CardButton key={c.path} card={c} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatistiquesPage;