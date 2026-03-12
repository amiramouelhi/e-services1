import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Depot {
  id: number;
  dateCreation: string;
  statut: "EN_ATTENTE" | "ACCEPTE" | "REJETE" | "PAYE" | "CERTIFIE";
  motifRejet: string | null;
  oeuvre: {
    titre_fr: string | null;
    titre_ar: string | null;
    categorie: { nom_fr: string; nom_ar: string };
  };
  deposant: {
    nomComplet_fr: string | null;
    nomComplet_ar: string | null;
  };
  auteurs: { auteur: { nomComplet_fr: string | null; nomComplet_ar: string | null } }[];
}

const statutConfig: Record<
  Depot["statut"],
  { label: string; bg: string; text: string; border: string }
> = {
  EN_ATTENTE: {
    label: "En attente de vérification",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  ACCEPTE: {
    label: "Accepté — Veuillez payer 30 DT",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",
  },
  REJETE: {
    label: "Rejeté",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
  },
  PAYE: {
    label: "Paiement confirmé",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  CERTIFIE: {
    label: "Certifié",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-300",
  },
};

const MesDepotsPage = () => {
  const navigate = useNavigate();
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/depots/mes-depots", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des dépôts");
        return res.json();
      })
      .then((data: Depot[]) => {
        setDepots(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [navigate]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 border-b border-border/60"
        style={{ background: "hsl(215 60% 22%)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-base font-semibold text-white tracking-tight">
            Mes Dépôts / إيداعاتي
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header with action button */}
        <div className="paper-form mb-6 overflow-hidden">
          <div
            className="px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ background: "hsl(215 45% 94%)" }}
          >
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Mes Dépôts
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Suivez l'état de vos demandes de dépôt
              </p>
            </div>
            <button
              onClick={() => navigate("/deposit")}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nouveau Dépôt
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="paper-form px-6 py-16 flex flex-col items-center justify-center gap-3">
            <div
              className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"
            />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && depots.length === 0 && (
          <div className="paper-form px-6 py-16 flex flex-col items-center justify-center gap-3">
            <svg className="w-12 h-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-muted-foreground">Aucun dépôt pour le moment</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && depots.length > 0 && (
          <div className="paper-form overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "hsl(215 45% 94%)" }}>
                    <th className="text-left px-5 py-3 font-semibold text-foreground">ID</th>
                    <th className="text-left px-5 py-3 font-semibold text-foreground">Titre</th>
                    <th className="text-left px-5 py-3 font-semibold text-foreground">Catégorie</th>
                    <th className="text-left px-5 py-3 font-semibold text-foreground">Date de dépôt</th>
                    <th className="text-left px-5 py-3 font-semibold text-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {depots.map((depot) => {
                    const cfg = statutConfig[depot.statut];
                    return (
                      <tr key={depot.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 text-muted-foreground font-medium">
                          {depot.id}
                        </td>
                        <td className="px-5 py-4 text-foreground font-medium">
                          {depot.oeuvre.titre_fr || depot.oeuvre.titre_ar}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {depot.oeuvre.categorie.nom_fr || depot.oeuvre.categorie.nom_ar}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {formatDate(depot.dateCreation)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                            >
                              {cfg.label}
                            </span>

                            {depot.statut === "REJETE" && depot.motifRejet && (
                              <p className="text-xs text-red-600 pl-1">
                                Motif : {depot.motifRejet}
                              </p>
                            )}

                            {depot.statut === "ACCEPTE" && (
                              <button
                                disabled
                                className="self-start mt-1 px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 border border-green-300 opacity-60 cursor-not-allowed"
                              >
                                Payer
                              </button>
                            )}

                            {depot.statut === "CERTIFIE" && (
                              <button
                                disabled
                                className="self-start mt-1 px-3 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300 opacity-60 cursor-not-allowed"
                              >
                                Télécharger le certificat
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesDepotsPage;
