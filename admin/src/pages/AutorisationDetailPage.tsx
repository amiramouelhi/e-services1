import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import WorkflowStepper, { type AutorisationStatut } from "../components/WorkflowStepper";

interface Depense {
  id: number;
  type: string;
  montant: number;
  fichier: string | null;
}

interface Artiste {
  id: number;
  nom: string;
  nationalite: string;
  pays: string | null;
  identite: string | null;
  depenses: Depense[];
}

interface Spectacle {
  id: number;
  dateSpectacle: string;
  horaireSpectacle: string | null;
  lieuSpectacle: string;
  typeSpectacle: string;
  budget: number | null;
  natureManif: string | null;
  artistes: Artiste[];
}

interface Autorisation {
  id: number;
  numeroAutorisation: string | null;
  dateDemande: string | null;
  dateCreation: string;
  statut: AutorisationStatut;
  nombreSpectacles: number;
  isOrganisateur: boolean;
  sfat: string | null;
  hasArtistesEtrangers: boolean;
  dateCommission: string | null;
  pvCommission: string | null;
  fichierFacture: string | null;
  numeroFacture: string | null;
  prisEnChargeAt: string | null;
  authoriseAt: string | null;
  organisateur: {
    id: number;
    nom: string;
    mf: string | null;
    adresse: string | null;
    telephone: string | null;
  } | null;
  spectacles: Spectacle[];
}

const API = import.meta.env.VITE_API_URL;

const statutBadge: Record<AutorisationStatut, { label: string; bg: string; text: string }> = {
  EN_COURS_EXAMEN:     { label: "Dépôt de la demande",        bg: "bg-gray-50 border-gray-300",     text: "text-gray-700" },
  EN_COURS_TRAITEMENT: { label: "En cours de traitement",     bg: "bg-blue-50 border-blue-300",     text: "text-blue-700" },
  EN_ATTENTE_PAIEMENT: { label: "En attente de paiement",     bg: "bg-orange-50 border-orange-300", text: "text-orange-700" },
  PAIEMENT_RECU:       { label: "Paiement reçu",              bg: "bg-purple-50 border-purple-300", text: "text-purple-700" },
  AUTORISE:            { label: "Autorisé",                   bg: "bg-green-50 border-green-300",   text: "text-green-700" },
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const getToken = () => localStorage.getItem("adminToken");

const AutorisationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [autorisation, setAutorisation] = useState<Autorisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchAutorisation = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch(`${API}/admin/autorisations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data: Autorisation = await res.json();
      setAutorisation(data);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchAutorisation(); }, [fetchAutorisation]);

  const runAction = async (path: string) => {
    const token = getToken();
    if (!token) { navigate("/"); return; }
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`${API}/admin/autorisations/${id}/${path}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      await fetchAutorisation();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActionLoading(false);
    }
  };

  const badge = autorisation ? statutBadge[autorisation.statut] : null;
  const totalArtistes = autorisation
    ? autorisation.spectacles.reduce((sum, s) => sum + s.artistes.length, 0)
    : 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Back */}
      <div className="mb-4">
        <Link
          to="/dashboard/autorisations"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au suivi
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
            Dossier d'autorisation {autorisation?.numeroAutorisation ? `N° ${autorisation.numeroAutorisation}` : `#${id}`}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Suivi et actions sur le dossier
          </p>
        </div>
        {badge && (
          <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
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

      {!loading && autorisation && (
        <>
          {/* Stepper */}
          <WorkflowStepper statut={autorisation.statut} />

          {/* Action bar */}
          <div className="paper-form p-4 mb-6 mt-4">
            <div className="flex flex-wrap items-center gap-3">
              {autorisation.statut === "EN_COURS_EXAMEN" && (
                <button
                  onClick={() => runAction("prendre-en-charge")}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
                  style={{ background: "hsl(215 60% 22%)" }}
                >
                  {actionLoading ? "..." : "Prendre en charge"}
                </button>
              )}
              {autorisation.statut === "EN_COURS_TRAITEMENT" && (
                <div className="flex flex-col gap-2">
                  {autorisation.prisEnChargeAt && (
                    <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Dossier pris en charge le {formatDate(autorisation.prisEnChargeAt)}
                    </p>
                  )}
                  <button
                    onClick={() => runAction("generer-facture")}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
                    style={{ background: "hsl(215 60% 22%)" }}
                  >
                    {actionLoading ? "..." : "Générer la facture"}
                  </button>
                </div>
              )}
              {autorisation.statut === "EN_ATTENTE_PAIEMENT" && (
                <button
                  onClick={() => runAction("delivrer")}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
                  style={{ background: "#10b981" }}
                >
                  {actionLoading ? "..." : "Valider le paiement et délivrer l'autorisation"}
                </button>
              )}
              {autorisation.statut === "AUTORISE" && (
                <p className="text-sm font-medium" style={{ color: "#10b981" }}>
                  ✓ Autorisation délivrée{autorisation.authoriseAt ? ` le ${formatDate(autorisation.authoriseAt)}` : ""}
                </p>
              )}
              {actionError && (
                <span className="text-sm" style={{ color: "hsl(var(--destructive))" }}>
                  {actionError}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="paper-form overflow-hidden mb-6">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Informations du dossier
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>N° Autorisation</p>
                <p style={{ color: "hsl(var(--foreground))" }}>{autorisation.numeroAutorisation || "—"}</p>
              </div>
              <div>
                <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Date de création</p>
                <p style={{ color: "hsl(var(--foreground))" }}>{formatDate(autorisation.dateCreation)}</p>
              </div>
              <div>
                <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Date de demande</p>
                <p style={{ color: "hsl(var(--foreground))" }}>{formatDate(autorisation.dateDemande)}</p>
              </div>
              <div>
                <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Nombre de spectacles</p>
                <p style={{ color: "hsl(var(--foreground))" }}>{autorisation.nombreSpectacles}</p>
              </div>
              <div>
                <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Nombre d'artistes</p>
                <p style={{ color: "hsl(var(--foreground))" }}>{totalArtistes}</p>
              </div>
              <div>
                <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>N° Facture</p>
                <p style={{ color: "hsl(var(--foreground))" }}>{autorisation.numeroFacture || "—"}</p>
              </div>
            </div>
          </div>

          {/* Organisateur */}
          <div className="paper-form overflow-hidden mb-6">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Organisateur
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {autorisation.organisateur ? (
                <>
                  <div>
                    <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Nom</p>
                    <p style={{ color: "hsl(var(--foreground))" }}>{autorisation.organisateur.nom}</p>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Matricule fiscal</p>
                    <p style={{ color: "hsl(var(--foreground))" }}>{autorisation.organisateur.mf || "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Téléphone</p>
                    <p style={{ color: "hsl(var(--foreground))" }}>{autorisation.organisateur.telephone || "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Adresse</p>
                    <p style={{ color: "hsl(var(--foreground))" }}>{autorisation.organisateur.adresse || "—"}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Aucun organisateur enregistré (qualité : {autorisation.sfat || "—"})
                </p>
              )}
            </div>
          </div>

          {/* Spectacles */}
          <div className="paper-form overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Spectacles ({autorisation.spectacles.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "hsl(var(--surface-muted))" }}>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Date</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Lieu</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Type</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Nature</th>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Artistes</th>
                  </tr>
                </thead>
                <tbody>
                  {autorisation.spectacles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Aucun spectacle
                      </td>
                    </tr>
                  )}
                  {autorisation.spectacles.map((sp) => (
                    <tr
                      key={sp.id}
                      style={{ borderBottom: "1px solid hsl(var(--border))" }}
                    >
                      <td className="px-5 py-3 whitespace-nowrap" style={{ color: "hsl(var(--foreground))" }}>
                        {formatDate(sp.dateSpectacle)} {sp.horaireSpectacle || ""}
                      </td>
                      <td className="px-5 py-3 max-w-[200px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                        {sp.lieuSpectacle}
                      </td>
                      <td className="px-5 py-3" style={{ color: "hsl(var(--foreground))" }}>{sp.typeSpectacle}</td>
                      <td className="px-5 py-3" style={{ color: "hsl(var(--muted-foreground))" }}>{sp.natureManif || "—"}</td>
                      <td className="px-5 py-3" style={{ color: "hsl(var(--foreground))" }}>{sp.artistes.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AutorisationDetailPage;
