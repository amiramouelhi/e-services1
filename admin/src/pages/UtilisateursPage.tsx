import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Deposant {
  id: number;
  nomComplet_fr: string | null;
  nomComplet_ar: string | null;
  raisonSociale: string | null;
  cin: string | null;
  telephone: string | null;
  adresse_fr: string | null;
  adresse_ar: string | null;
  typeDeposant: "PHYSIQUE" | "MORALE" | null;
  _count: { depots: number };
}

const getToken = () => localStorage.getItem("adminToken");

const displayName = (d: Deposant) =>
  d.nomComplet_fr || d.nomComplet_ar || d.raisonSociale || "—";

const displayAdresse = (d: Deposant) =>
  d.adresse_fr || d.adresse_ar || "—";

const UtilisateursPage = () => {
  const navigate = useNavigate();
  const [deposants, setDeposants] = useState<Deposant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Deposant | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchDeposants = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch("http://localhost:5000/admin/deposants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des deposants");
      const data: Deposant[] = await res.json();
      setDeposants(data);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchDeposants(); }, [fetchDeposants]);

  const handleDelete = async (id: number) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`http://localhost:5000/admin/deposants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur lors de la suppression");
      }
      setDeleteTarget(null);
      setDeposants((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter
  const q = search.toLowerCase().trim();
  const filtered = q
    ? deposants.filter((d) =>
        (d.nomComplet_fr?.toLowerCase().includes(q)) ||
        (d.nomComplet_ar?.toLowerCase().includes(q)) ||
        (d.raisonSociale?.toLowerCase().includes(q)) ||
        (d.cin?.toLowerCase().includes(q))
      )
    : deposants;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
            Deposants / المودعون
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            {!loading && !error && `${deposants.length} deposant${deposants.length !== 1 ? "s" : ""} au total`}
            {loading && "Chargement..."}
          </p>
        </div>

        {/* Search */}
        {!loading && !error && (
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "hsl(var(--muted-foreground))" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, CIN..."
              className="input-field pl-9"
            />
          </div>
        )}
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

      {/* Table */}
      {!loading && !error && (
        <div className="paper-form overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "hsl(215 45% 94%)" }}>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>ID</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Nom / Raison Sociale</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>CIN</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Telephone</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Adresse</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Type</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Depots</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {search ? "Aucun resultat pour cette recherche" : "Aucun deposant pour le moment"}
                    </td>
                  </tr>
                )}
                {filtered.map((dep) => (
                  <tr
                    key={dep.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid hsl(var(--border))" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "hsl(var(--muted) / 0.3)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-4 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {dep.id}
                    </td>
                    <td className="px-5 py-4 font-medium max-w-[200px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                      {displayName(dep)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>
                      {dep.cin || "—"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {dep.telephone || "—"}
                    </td>
                    <td className="px-5 py-4 max-w-[180px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {displayAdresse(dep)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-md border ${
                          dep.typeDeposant === "PHYSIQUE"
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : dep.typeDeposant === "MORALE"
                            ? "bg-orange-50 border-orange-300 text-orange-700"
                            : "bg-gray-50 border-gray-300 text-gray-700"
                        }`}
                      >
                        {dep.typeDeposant === "PHYSIQUE" ? "Personne Physique" : dep.typeDeposant === "MORALE" ? "Personne Morale" : "Non defini"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-medium" style={{ color: "hsl(var(--foreground))" }}>
                      {dep._count.depots}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => { setActionError(""); setDeleteTarget(dep); }}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRMATION ============ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10">
            <div className="paper-form w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>Supprimer le deposant</h3>
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{displayName(deleteTarget)}</p>
                </div>
              </div>
              <p className="text-sm mb-5" style={{ color: "hsl(var(--foreground))" }}>
                Etes-vous sur de vouloir supprimer ce deposant ? Cette action est irreversible.
              </p>
              {actionError && (
                <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)", color: "hsl(var(--destructive))" }}>
                  {actionError}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? "En cours..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UtilisateursPage;
