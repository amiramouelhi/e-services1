import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Depot {
  id: number;
  dateDepot: string;
  statut: string;
  typeDeposant: "PHYSIQUE" | "MORALE";
  deposant: {
    nomComplet_fr: string | null;
    nomComplet_ar: string | null;
    raisonSociale: string | null;
  };
  oeuvre: {
    titre_fr: string | null;
    titre_ar: string | null;
  };
}

const statCards: { key: string; label: string; color: string }[] = [
  { key: "ALL",        label: "Total dépôts",         color: "#1a3c6e" },
  { key: "CERTIFIE",   label: "Certifiés",            color: "#10b981" },
  { key: "EN_ATTENTE_RENOUVELLEMENT", label: "Renouvellement requis", color: "#f97316" },
  { key: "EN_ATTENTE", label: "En cours",             color: "#6b7280" },
];

const statutBadge: Record<string, { label: string; bg: string; text: string }> = {
  CERTIFIE:   { label: "Certifié",              bg: "bg-green-50 border-green-300",  text: "text-green-700" },
  EN_ATTENTE_RENOUVELLEMENT: { label: "Renouvellement requis", bg: "bg-orange-50 border-orange-300", text: "text-orange-700" },
  EN_ATTENTE: { label: "En cours",              bg: "bg-gray-50 border-gray-300",    text: "text-gray-700" },
};

const MONTHS = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const deposantName = (d: Depot) =>
  d.deposant.nomComplet_fr || d.deposant.nomComplet_ar || d.deposant.raisonSociale || "—";

const oeuvreTitle = (d: Depot) =>
  d.oeuvre.titre_fr || d.oeuvre.titre_ar || "—";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDepots = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/depots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des donnees");
      const data: Depot[] = await res.json();
      setDepots(data);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchDepots(); }, [fetchDepots]);

  // Counts per statut
  const counts: Record<string, number> = { ALL: depots.length };
  for (const d of depots) counts[d.statut] = (counts[d.statut] || 0) + 1;

  // Last 5 depots
  const recentDepots = [...depots].slice(-5).reverse();

  // Monthly chart data for current year
  const currentYear = new Date().getFullYear();
  const monthlyData = MONTHS.map((name, i) => ({
    name,
    depots: depots.filter((d) => {
      const date = new Date(d.dateDepot);
      return date.getFullYear() === currentYear && date.getMonth() === i;
    }).length,
  }));

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
          Tableau de bord
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          Vue d'ensemble
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

      {/* Content */}
      {!loading && !error && (
        <>
          {/* ===== STAT CARDS ===== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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

          {/* ===== RECENT DEPOTS TABLE ===== */}
          <div className="paper-form overflow-hidden mb-8">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Derniers depots
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "hsl(var(--surface-muted))" }}>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>ID</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Deposant</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Titre</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Date</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDepots.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Aucun depot
                      </td>
                    </tr>
                  )}
                  {recentDepots.map((depot) => {
                    const badge = statutBadge[depot.statut] || { label: "En cours", bg: "bg-gray-50 border-gray-300", text: "text-gray-700" };
                    return (
                      <tr
                        key={depot.id}
                        className="transition-colors"
                        style={{ borderBottom: "1px solid hsl(var(--border))" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "hsl(var(--muted) / 0.3)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td className="px-5 py-4 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {depot.id}
                        </td>
                        <td className="px-5 py-4 font-medium max-w-[200px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                          {deposantName(depot)}
                        </td>
                        <td className="px-5 py-4 max-w-[200px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                          {oeuvreTitle(depot)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {formatDate(depot.dateDepot)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 text-right" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <Link
                to="/dashboard/depots"
                className="text-sm font-medium transition-colors"
                style={{ color: "hsl(var(--primary))" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "hsl(215 60% 30%)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "hsl(var(--primary))"}
              >
                Voir tous les depots &rarr;
              </Link>
            </div>
          </div>

          {/* ===== CHART ===== */}
          <div className="paper-form overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Depots par mois &mdash; {currentYear}
              </h3>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 88%)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "hsl(215 15% 50%)" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(215 20% 88%)" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "hsl(215 15% 50%)" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(215 20% 88%)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--surface))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    labelStyle={{ fontWeight: 600, color: "hsl(var(--foreground))" }}
                    formatter={(value) => [value, "Depots"]}
                  />
                  <Bar dataKey="depots" fill="#1a3c6e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome;
