import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

//types

interface Depot {
  id: number;
  dateDepot: string;
  dateCreation: string;
  statut: string;
  montant: number | null;
  motifRejet: string | null;
  typeDeposant: "PHYSIQUE" | "MORALE";
  deposant: {
    nomComplet_fr: string | null;
    nomComplet_ar: string | null;
    raisonSociale: string | null;
    cin: string | null;
    adresse: string | null;
    telephone: string | null;
    fax: string | null;
    email: string | null;
    registreCommerce: string | null;
    fichierCIN: string | null;
    fichierRNE: string | null;
    fichierProcuration: string | null;
    fichierDossierJuridique: string | null;
  };
  oeuvre: {
    titre_fr: string | null;
    titre_ar: string | null;
    description: string | null;
    typeSupport: string | null;
    categorie: { nom_fr: string; nom_ar: string } | null;
  };
  auteurs: { auteur: { nomComplet_fr: string | null; nomComplet_ar: string | null } }[];
}

const statutBadge: Record<string, { label: string; bg: string; text: string }> = {
  CERTIFIE:   { label: "Certifié",              bg: "bg-green-50 border-green-300",  text: "text-green-700" },
  EN_ATTENTE_RENOUVELLEMENT: { label: "Renouvellement requis", bg: "bg-orange-50 border-orange-300", text: "text-orange-700" },
  EN_ATTENTE: { label: "En cours",              bg: "bg-gray-50 border-gray-300",    text: "text-gray-700" },
};

//helpers

const getToken = () => localStorage.getItem("adminToken");

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const deposantName = (d: Depot) =>
  d.deposant.nomComplet_fr || d.deposant.nomComplet_ar || d.deposant.raisonSociale || "—";

const oeuvreTitle = (d: Depot) =>
  d.oeuvre.titre_fr || d.oeuvre.titre_ar || "—";

//main component

const DepotsPage = () => {
  const navigate = useNavigate();
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [viewDepot, setViewDepot] = useState<Depot | null>(null);
  const [confirmAccept, setConfirmAccept] = useState<Depot | null>(null);
  const [rejectDepot, setRejectDepot] = useState<Depot | null>(null);
  const [deleteDepot, setDeleteDepot] = useState<Depot | null>(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchDepots = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/depots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data: Depot[] = await res.json();
      setDepots(data);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!getToken()) { navigate("/"); return; }
    fetchDepots();
  }, [navigate, fetchDepots]);

  /* Actions */
  const handleAccept = async (id: number) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/depots/${id}/accepter`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      setConfirmAccept(null);
      await fetchDepots();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/depots/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      setDeleteDepot(null);
      setDepots((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!motifRejet.trim()) { setActionError("Le motif de rejet est obligatoire"); return; }
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/depots/${id}/rejeter`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motifRejet }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      setRejectDepot(null);
      setMotifRejet("");
      await fetchDepots();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
          Depots
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          Gestion des depots
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

      {/* Table */}
      {!loading && !error && (
        <div className="paper-form overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "hsl(var(--surface-muted))" }}>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>ID</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Deposant</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Titre</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Categorie</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Type</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Date</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Statut</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {depots.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Aucun depot
                    </td>
                  </tr>
                )}
                {depots.map((depot) => {
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
                      <td className="px-5 py-4 font-medium max-w-[180px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                        {deposantName(depot)}
                      </td>
                      <td className="px-5 py-4 max-w-[180px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                        {oeuvreTitle(depot)}
                      </td>
                      <td className="px-5 py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {depot.oeuvre.categorie?.nom_fr || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
                        >
                          {depot.typeDeposant}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {formatDate(depot.dateDepot)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewDepot(depot)}
                            className="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "hsl(var(--muted))"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "hsl(var(--secondary))"}
                          >
                            Voir
                          </button>
                          {depot.statut === "EN_ATTENTE" && (
                            <>
                              <button
                                onClick={() => { setActionError(""); setConfirmAccept(depot); }}
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                              >
                                Accepter
                              </button>
                              <button
                                onClick={() => { setActionError(""); setMotifRejet(""); setRejectDepot(depot); }}
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                              >
                                Rejeter
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setActionError(""); setDeleteDepot(depot); }}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                          >
                            Supprimer
                          </button>
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

      {/* ============ VIEW MODAL ============ */}
      {viewDepot && (
        <ModalOverlay onClose={() => setViewDepot(null)}>
          <div className="paper-form w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl">
            <div
              className="sticky top-0 px-6 py-4 flex items-center justify-between rounded-t-xl border-b"
              style={{ background: "hsl(215 60% 22%)", borderColor: "hsl(215 60% 18%)" }}
            >
              <h3 className="text-base font-semibold text-white">Depot #{viewDepot.id}</h3>
              <button onClick={() => setViewDepot(null)} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <DetailSection title="Informations du depot">
                <DetailRow label="ID" value={String(viewDepot.id)} />
                <DetailRow label="Date de depot" value={formatDate(viewDepot.dateDepot)} />
                <DetailRow label="Date de creation" value={formatDate(viewDepot.dateCreation)} />
                <DetailRow label="Statut" value={(statutBadge[viewDepot.statut] || { label: "En cours" }).label} />
                <DetailRow label="Montant" value={viewDepot.montant ? `${viewDepot.montant} DT` : "—"} />
                {viewDepot.statut === "REJETE" && viewDepot.motifRejet && (
                  <DetailRow label="Motif de rejet" value={viewDepot.motifRejet} />
                )}
              </DetailSection>

              <DetailSection title="Le Deposant">
                <DetailRow label="Type" value={viewDepot.typeDeposant === "PHYSIQUE" ? "Personne Physique" : "Personne Morale"} />
                {viewDepot.deposant.nomComplet_fr && <DetailRow label="Nom (FR)" value={viewDepot.deposant.nomComplet_fr} />}
                {viewDepot.deposant.nomComplet_ar && <DetailRow label="Nom (AR)" value={viewDepot.deposant.nomComplet_ar} />}
                {viewDepot.deposant.raisonSociale && <DetailRow label="Raison sociale" value={viewDepot.deposant.raisonSociale} />}
                {viewDepot.deposant.cin && <DetailRow label="CIN" value={viewDepot.deposant.cin} />}
                {viewDepot.deposant.registreCommerce && <DetailRow label="Registre commerce" value={viewDepot.deposant.registreCommerce} />}
                {viewDepot.deposant.adresse && <DetailRow label="Adresse" value={viewDepot.deposant.adresse} />}
                {viewDepot.deposant.telephone && <DetailRow label="Telephone" value={viewDepot.deposant.telephone} />}
                {viewDepot.deposant.fax && <DetailRow label="Fax" value={viewDepot.deposant.fax} />}
                {viewDepot.deposant.email && <DetailRow label="Email" value={viewDepot.deposant.email} />}
                <div className="pt-3 mt-3 space-y-1.5" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>Documents :</p>
                  <DocLink label="CIN" filename={viewDepot.deposant.fichierCIN} />
                  <DocLink label="RNE" filename={viewDepot.deposant.fichierRNE} />
                  <DocLink label="Procuration" filename={viewDepot.deposant.fichierProcuration} />
                  <DocLink label="Dossier Juridique" filename={viewDepot.deposant.fichierDossierJuridique} />
                </div>
              </DetailSection>

              <DetailSection title="L'Oeuvre">
                {viewDepot.oeuvre.titre_fr && <DetailRow label="Titre (FR)" value={viewDepot.oeuvre.titre_fr} />}
                {viewDepot.oeuvre.titre_ar && <DetailRow label="Titre (AR)" value={viewDepot.oeuvre.titre_ar} />}
                {viewDepot.oeuvre.description && <DetailRow label="Description" value={viewDepot.oeuvre.description} />}
                {viewDepot.oeuvre.typeSupport && <DetailRow label="Support" value={viewDepot.oeuvre.typeSupport} />}
                <DetailRow label="Categorie" value={viewDepot.oeuvre.categorie?.nom_fr || "—"} />
              </DetailSection>

              <DetailSection title="Auteur(s)">
                {viewDepot.auteurs.length === 0 && (
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Aucun auteur</p>
                )}
                {viewDepot.auteurs.map((a, i) => (
                  <DetailRow key={i} label={`Auteur ${i + 1}`} value={a.auteur.nomComplet_fr || a.auteur.nomComplet_ar || "—"} />
                ))}
              </DetailSection>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ============ ACCEPT CONFIRMATION ============ */}
      {confirmAccept && (
        <ModalOverlay onClose={() => setConfirmAccept(null)}>
          <div className="paper-form w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>Accepter le depot</h3>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Depot #{confirmAccept.id}</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: "hsl(var(--foreground))" }}>
              Etes-vous sur d'accepter ce depot ?
            </p>
            {actionError && (
              <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)", color: "hsl(var(--destructive))" }}>
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmAccept(null)} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}>
                Annuler
              </button>
              <button onClick={() => handleAccept(confirmAccept.id)} disabled={actionLoading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60">
                {actionLoading ? "En cours..." : "Confirmer"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ============ REJECT MODAL ============ */}
      {rejectDepot && (
        <ModalOverlay onClose={() => setRejectDepot(null)}>
          <div className="paper-form w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>Rejeter le depot</h3>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Depot #{rejectDepot.id}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
                Motif du rejet <span style={{ color: "hsl(var(--destructive))" }}>*</span>
              </label>
              <textarea value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)} rows={4} placeholder="Saisissez le motif du rejet..." className="input-field resize-none" />
            </div>
            {actionError && (
              <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)", color: "hsl(var(--destructive))" }}>
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectDepot(null)} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}>
                Annuler
              </button>
              <button onClick={() => handleReject(rejectDepot.id)} disabled={actionLoading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60">
                {actionLoading ? "En cours..." : "Rejeter"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ============ DELETE CONFIRMATION ============ */}
      {deleteDepot && (
        <ModalOverlay onClose={() => setDeleteDepot(null)}>
          <div className="paper-form w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>Supprimer le depot</h3>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Depot #{deleteDepot.id}</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: "hsl(var(--foreground))" }}>
              Etes-vous sur de vouloir supprimer ce depot ? Cette action est irreversible.
            </p>
            {actionError && (
              <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)", color: "hsl(var(--destructive))" }}>
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteDepot(null)} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}>
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteDepot.id)} disabled={actionLoading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60">
                {actionLoading ? "En cours..." : "Supprimer"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

//sub components

const ModalOverlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative z-10">{children}</div>
  </div>
);

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-sm font-bold pb-2 mb-3" style={{ color: "hsl(var(--primary))", borderBottom: "1px solid hsl(var(--border))" }}>
      {title}
    </h4>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3">
    <span className="text-xs font-medium w-36 flex-shrink-0 text-right" style={{ color: "hsl(var(--muted-foreground))" }}>
      {label} :
    </span>
    <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{value}</span>
  </div>
);

const DocLink = ({ label, filename }: { label: string; filename: string | null }) => {
  if (!filename) return null;
  return (
    <div className="flex gap-3">
      <span className="text-xs font-medium w-36 flex-shrink-0 text-right" style={{ color: "hsl(var(--muted-foreground))" }}>
        {label} :
      </span>
      <a
        href={`${import.meta.env.VITE_API_URL}/uploads/documents/${filename}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline transition-colors"
        style={{ color: "hsl(var(--primary))" }}
        onMouseEnter={(e) => e.currentTarget.style.color = "hsl(215 60% 28%)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "hsl(var(--primary))"}
      >
        {filename}
      </a>
    </div>
  );
};

export default DepotsPage;
