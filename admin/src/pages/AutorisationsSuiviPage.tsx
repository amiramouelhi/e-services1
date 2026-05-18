import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type AutorisationStatut =
  | "EN_COURS_EXAMEN"
  | "EN_COURS_TRAITEMENT"
  | "EN_ATTENTE_PAIEMENT"
  | "PAIEMENT_RECU"
  | "AUTORISE";

interface Autorisation {
  id: number;
  numero: string | null;
  createdAt: string;
  statut: AutorisationStatut;
  organisateur: { nom: string } | null;
  lieu: string | null;
  nombreSpectacles: number;
  nombreArtistes: number;
  natureSpectacle: string | null;
}

const statCards: { key: "ALL" | AutorisationStatut; label: string; color: string }[] = [
  { key: "ALL",                  label: "Total dossiers",          color: "#1a3c6e" },
  { key: "EN_COURS_EXAMEN",      label: "Dépôt de la demande",     color: "#6b7280" },
  { key: "EN_COURS_TRAITEMENT",  label: "En cours de traitement",  color: "#3b82f6" },
  { key: "EN_ATTENTE_PAIEMENT",  label: "En attente de paiement",  color: "#f97316" },
  { key: "PAIEMENT_RECU",        label: "Paiement reçu",           color: "#8b5cf6" },
  { key: "AUTORISE",             label: "Autorisé",                color: "#10b981" },
];

const statutBadge: Record<AutorisationStatut, { label: string; bg: string; text: string }> = {
  EN_COURS_EXAMEN:     { label: "Dépôt de la demande",    bg: "bg-gray-50 border-gray-300",     text: "text-gray-700" },
  EN_COURS_TRAITEMENT: { label: "En cours de traitement", bg: "bg-blue-50 border-blue-300",     text: "text-blue-700" },
  EN_ATTENTE_PAIEMENT: { label: "En attente de paiement", bg: "bg-orange-50 border-orange-300", text: "text-orange-700" },
  PAIEMENT_RECU:       { label: "Paiement reçu",          bg: "bg-purple-50 border-purple-300", text: "text-purple-700" },
  AUTORISE:            { label: "Autorisé",               bg: "bg-green-50 border-green-300",   text: "text-green-700" },
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const getToken = () => localStorage.getItem("adminToken");

const AutorisationsSuiviPage = () => {
  const navigate = useNavigate();
  const [autorisations, setAutorisations] = useState<Autorisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<"ALL" | AutorisationStatut>("ALL");

  const fetchAutorisations = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/autorisations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des données");
      const data: Autorisation[] = await res.json();
      setAutorisations(data);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAutorisations(); }, [fetchAutorisations]);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { ALL: autorisations.length };
    for (const a of autorisations) c[a.statut] = (c[a.statut] || 0) + 1;
    return c;
  }, [autorisations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return autorisations.filter(a => {
      if (statutFilter !== "ALL" && a.statut !== statutFilter) return false;
      if (!q) return true;
      const nom = a.organisateur?.nom?.toLowerCase() || "";
      const numero = a.numero?.toLowerCase() || "";
      return nom.includes(q) || numero.includes(q);
    });
  }, [autorisations, search, statutFilter]);

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
          Suivi des autorisations
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          Dossiers d'autorisation de spectacles
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="paper-form p-16 flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-[3px] rounded-full animate-spin"
            style={{ borderColor: "hsl(var(--primary) / 0.2)", borderTopColor: "hsl(var(--primary))" }}
          />
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Chargement...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "hsl(var(--destructive) / 0.1)",
            border: "1px solid hsl(var(--destructive) / 0.3)",
            color: "hsl(var(--destructive))",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {statCards.map((sc) => (
              <div
                key={sc.key}
                className="paper-form p-4 flex flex-col justify-center"
                style={{ borderLeft: `4px solid ${sc.color}` }}
              >
                <p className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
                  {counts[sc.key] || 0}
                </p>
                <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {sc.label}
                </p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="paper-form p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Rechercher par organisateur ou numéro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--surface))",
                color: "hsl(var(--foreground))",
              }}
            />
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value as "ALL" | AutorisationStatut)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--surface))",
                color: "hsl(var(--foreground))",
                minWidth: "220px",
              }}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="EN_COURS_EXAMEN">Dépôt de la demande</option>
              <option value="EN_COURS_TRAITEMENT">En cours de traitement</option>
              <option value="EN_ATTENTE_PAIEMENT">En attente de paiement</option>
              <option value="PAIEMENT_RECU">Paiement reçu</option>
              <option value="AUTORISE">Autorisé</option>
            </select>
          </div>

          {/* Main table */}
          <div className="paper-form overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Dossiers ({filtered.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "hsl(var(--surface-muted))" }}>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Numéro</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Date</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Organisateur</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Lieu</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Nb Spectacles</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Nb Artistes</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Nature</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Statut</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Aucune autorisation
                      </td>
                    </tr>
                  )}
                  {filtered.map((a) => {
                    const badge = statutBadge[a.statut];
                    return (
                      <tr
                        key={a.id}
                        className="transition-colors cursor-pointer"
                        style={{ borderBottom: "1px solid hsl(var(--border))" }}
                        onClick={() => navigate(`/dashboard/autorisations/${a.id}`)}
                        onMouseEnter={(e) => e.currentTarget.style.background = "hsl(var(--muted) / 0.3)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td className="px-5 py-4 font-medium" style={{ color: "hsl(var(--foreground))" }}>
                          {a.numero || "—"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {formatDate(a.createdAt)}
                        </td>
                        <td className="px-5 py-4 max-w-[220px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                          {a.organisateur?.nom || "—"}
                        </td>
                        <td className="px-5 py-4 max-w-[200px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                          {a.lieu || "—"}
                        </td>
                        <td className="px-5 py-4 text-center" style={{ color: "hsl(var(--foreground))" }}>
                          {a.nombreSpectacles}
                        </td>
                        <td className="px-5 py-4 text-center" style={{ color: "hsl(var(--foreground))" }}>
                          {a.nombreArtistes}
                        </td>
                        <td className="px-5 py-4 max-w-[180px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {a.natureSpectacle || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/autorisations/${a.id}`);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-md text-white"
                            style={{ background: "hsl(215 60% 22%)" }}
                          >
                            Voir détail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AutorisationsSuiviPage;
