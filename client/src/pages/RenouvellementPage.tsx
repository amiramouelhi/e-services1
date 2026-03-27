import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Depot {
  id: number;
  numeroSequentiel: number | null;
  dateDepot: string;
  dateExpiration: string | null;
  statut: string;
  deposant: {
    nomComplet_fr: string | null;
    nomComplet_ar: string | null;
    raisonSociale: string | null;
    cin: string | null;
    registreCommerce: string | null;
  };
  oeuvre: {
    titre_fr: string | null;
    titre_ar: string | null;
    categorie: { code: number; nom_fr: string };
  };
}

type Lang = "ar" | "fr";

const statutConfigByLang: Record<Lang, Record<string, { label: string; bg: string; text: string; border: string }>> = {
  fr: {
    CERTIFIE: { label: "Certifié", bg: "bg-green-50", text: "text-green-700", border: "border-green-300" },
    EN_ATTENTE_RENOUVELLEMENT: { label: "Renouvellement requis", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
    EN_ATTENTE: { label: "En cours", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300" },
  },
  ar: {
    CERTIFIE: { label: "مصادق عليه", bg: "bg-green-50", text: "text-green-700", border: "border-green-300" },
    EN_ATTENTE_RENOUVELLEMENT: { label: "يتطلب التجديد", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
    EN_ATTENTE: { label: "قيد المعالجة", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300" },
  },
};

const Tr = {
  ar: {
    topBarTitle: "تجديد الإيداع",
    back: "رجوع",
    stepDemande: "طلب",
    stepRecherche: "بحث",
    step1Title: "طلب التجديد",
    step1Desc: "قم بتحميل طلب التجديد المملوء والموقع",
    step1Label: "طلب التجديد",
    step1Next: "التالي",
    step1FileSelected: "الملف المختار : ",
    step1FormatError: "صيغة غير مدعومة. استخدم PDF أو JPG أو PNG.",
    step1SizeError: "حجم الملف لا يجب أن يتجاوز 5 ميغابايت.",
    step2Title: "البحث عن الإيداع",
    step2Placeholder: "البحث بالـ CIN أو رقم الإيداع أو MF أو RNE",
    step2BackToStep1: "رجوع إلى المرحلة 1",
    colNumero: "رقم الإيداع",
    colDeposant: "المودع",
    colTitre: "عنوان المصنف",
    colExpiration: "تاريخ الانتهاء",
    colStatut: "الحالة",
    colAction: "تجديد",
    btnRenew: "تجديد",
    noResult: "لا يوجد إيداع",
    loadingDepots: "...جارٍ تحميل الإيداعات",
    loadError: "خطأ أثناء تحميل الإيداعات",
    renewError: "خطأ أثناء التجديد",
    logout: "خروج",
  },
  fr: {
    topBarTitle: "Renouvellement de dépôt",
    back: "Retour",
    stepDemande: "Demande",
    stepRecherche: "Recherche",
    step1Title: "Demande de renouvellement",
    step1Desc: "Uploadez la demande de renouvellement remplie et signée",
    step1Label: "Demande de renouvellement",
    step1Next: "Suivant",
    step1FileSelected: "Fichier sélectionné : ",
    step1FormatError: "Format non supporté. Utilisez PDF, JPG ou PNG.",
    step1SizeError: "Le fichier ne doit pas dépasser 5 Mo.",
    step2Title: "Rechercher le dépôt",
    step2Placeholder: "Rechercher par CIN, numéro de dépôt, MF ou RNE",
    step2BackToStep1: "Retour à l'étape 1",
    colNumero: "Numéro de dépôt",
    colDeposant: "Déposant",
    colTitre: "Titre de l'oeuvre",
    colExpiration: "Date d'expiration",
    colStatut: "Statut",
    colAction: "Renouveler",
    btnRenew: "Renouveler",
    noResult: "Aucun dépôt trouvé",
    loadingDepots: "Chargement des dépôts...",
    loadError: "Erreur lors du chargement des dépôts",
    renewError: "Erreur lors du renouvellement",
    logout: "Déconnexion",
  },
};

const RENEWABLE_STATUTS = ["CERTIFIE", "EN_ATTENTE_RENOUVELLEMENT"];

const RenouvellementPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("ar");
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allDepots, setAllDepots] = useState<Depot[]>([]);
  const [loadingDepots, setLoadingDepots] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [renewError, setRenewError] = useState("");

  const t = Tr[lang];
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const statutConfig = statutConfigByLang[lang];
  const defaultCfg = { label: lang === "ar" ? "قيد المعالجة" : "En cours", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300" };

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (step !== 2) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingDepots(true);
    setLoadError("");
    fetch("http://localhost:5000/depots", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(t.loadError);
        return res.json();
      })
      .then((data: Depot[]) => setAllDepots(data))
      .catch((err: any) => setLoadError(err.message))
      .finally(() => setLoadingDepots(false));
  }, [step]);

  const filteredDepots = allDepots.filter((depot) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return [
      depot.deposant.cin,
      depot.deposant.nomComplet_fr,
      depot.deposant.nomComplet_ar,
      depot.deposant.raisonSociale,
      depot.deposant.registreCommerce,
      depot.numeroSequentiel != null ? String(depot.numeroSequentiel) : null,
    ].some((field) => field && field.toLowerCase().includes(q));
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatNumero = (depot: Depot) => {
    const seq = depot.numeroSequentiel ?? "—";
    const catCode = depot.oeuvre.categorie.code;
    const d = new Date(depot.dateDepot);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${seq}-${catCode}-${dd}-${mm}-${yyyy}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const f = e.target.files?.[0];
    if (!f) { setFile(null); return; }
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(f.type)) {
      setFileError(t.step1FormatError);
      setFile(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setFileError(t.step1SizeError);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleRenew = async (depotId: number) => {
    if (!file) return;
    setRenewingId(depotId);
    setRenewError("");
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("fichierDemandeRenouvellement", file);
      const res = await fetch(`http://localhost:5000/depots/${depotId}/renouveler`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t.renewError);
      }
      navigate(`/facture/${depotId}?type=renouvellement`);
    } catch (err: any) {
      setRenewError(err.message);
      setRenewingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 border-b border-border/60"
        style={{ background: "hsl(215 60% 22%)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14" dir="ltr">
          <button
            onClick={() => navigate("/dashboard/depot")}
            className="flex items-center gap-2 text-lg text-white/70 font-semibold hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t.back}
          </button>
          <h1 className="text-base font-semibold text-white tracking-tight">
            {t.topBarTitle}
          </h1>
          <button
            onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); }}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {t.logout}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Language toggle — top right */}
        <div className="flex justify-end mb-4">
          <div
            className="flex items-center rounded-full p-0.5"
            style={{ background: "hsl(215 25% 90%)" }}
          >
            <button
              onClick={() => setLang("ar")}
              className="relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200"
              style={
                lang === "ar"
                  ? { background: "white", color: "hsl(215 60% 22%)", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }
                  : { background: "transparent", color: "hsl(215 15% 50%)" }
              }
            >
              عربي
            </button>
            <button
              onClick={() => setLang("fr")}
              className="relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200"
              style={
                lang === "fr"
                  ? { background: "white", color: "hsl(215 60% 22%)", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }
                  : { background: "transparent", color: "hsl(215 15% 50%)" }
              }
            >
              Francais
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6" dir="ltr">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${step === 1 ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">1</span>
            {t.stepDemande}
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${step === 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">2</span>
            {t.stepRecherche}
          </div>
        </div>

        {/* Step 1 — Upload */}
        {step === 1 && (
          <div className="paper-form overflow-hidden">
            <div
              className="px-6 md:px-8 py-5"
              style={{ background: "hsl(215 45% 94%)" }}
            >
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {t.step1Title}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t.step1Desc}
              </p>
            </div>

            <div className="px-6 md:px-8 py-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.step1Label}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-border file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 file:cursor-pointer"
                dir="ltr"
              />
              {fileError && (
                <p className="mt-2 text-xs text-destructive">{fileError}</p>
              )}
              {file && (
                <p className="mt-2 text-xs text-green-600">
                  {t.step1FileSelected}{file.name}
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  disabled={!file}
                  onClick={() => setStep(2)}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.step1Next}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Browse & renew */}
        {step === 2 && (
          <>
            {/* Back button */}
            <button
              onClick={() => setStep(1)}
              className="mb-4 text-sm text-primary hover:underline flex items-center gap-1"
              dir="ltr"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {t.step2BackToStep1}
            </button>

            {/* Renewal error */}
            {renewError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {renewError}
              </div>
            )}

            {/* Load error */}
            {loadError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {loadError}
              </div>
            )}

            {/* Loading */}
            {loadingDepots && (
              <div className="paper-form px-6 py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">{t.loadingDepots}</p>
              </div>
            )}

            {/* Table with search */}
            {!loadingDepots && !loadError && (
              <div className="paper-form overflow-hidden">
                {/* Search input */}
                <div className="px-5 py-4 border-b border-border" style={{ background: "hsl(215 45% 94%)" }}>
                  <div className="flex items-center gap-3" dir="ltr">
                    <h2 className="text-lg font-bold text-foreground tracking-tight whitespace-nowrap">
                      {t.step2Title}
                    </h2>
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.step2Placeholder}
                        className="input-field w-full pl-9"
                      />
                    </div>
                  </div>
                </div>

                {filteredDepots.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" dir="ltr">
                      <thead>
                        <tr style={{ background: "hsl(215 45% 97%)" }}>
                          <th className="text-left px-5 py-3 font-semibold text-foreground">{t.colNumero}</th>
                          <th className="text-left px-5 py-3 font-semibold text-foreground">{t.colDeposant}</th>
                          <th className="text-left px-5 py-3 font-semibold text-foreground">{t.colTitre}</th>
                          <th className="text-left px-5 py-3 font-semibold text-foreground">{t.colExpiration}</th>
                          <th className="text-left px-5 py-3 font-semibold text-foreground">{t.colStatut}</th>
                          <th className="text-left px-5 py-3 font-semibold text-foreground">{t.colAction}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredDepots.map((depot) => {
                          const cfg = statutConfig[depot.statut] || defaultCfg;
                          const canRenew = RENEWABLE_STATUTS.includes(depot.statut);
                          return (
                            <tr key={depot.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-4 text-foreground font-medium">
                                {formatNumero(depot)}
                              </td>
                              <td className="px-5 py-4 text-muted-foreground">
                                {depot.deposant.nomComplet_fr || depot.deposant.nomComplet_ar || depot.deposant.raisonSociale || "—"}
                              </td>
                              <td className="px-5 py-4 text-muted-foreground">
                                {depot.oeuvre.titre_fr || depot.oeuvre.titre_ar || "—"}
                              </td>
                              <td className="px-5 py-4 text-muted-foreground">
                                {depot.dateExpiration ? formatDate(depot.dateExpiration) : "—"}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                {canRenew && (
                                  <button
                                    onClick={() => handleRenew(depot.id)}
                                    disabled={renewingId === depot.id}
                                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                  >
                                    {renewingId === depot.id ? (
                                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    )}
                                    {t.btnRenew}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-12 flex flex-col items-center justify-center gap-3">
                    <svg className="w-12 h-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm text-muted-foreground">{t.noResult}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RenouvellementPage;
