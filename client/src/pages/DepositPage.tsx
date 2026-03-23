import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  code: number;
  nom_fr: string;
  nom_ar: string;
}

type TypeDeposant = "PHYSIQUE" | "MORALE";

interface FormState {
  typeDeposant: TypeDeposant;
  nomComplet: string;
  cin: string;
  raisonSociale: string;
  registreCommerce: string;
  adresse: string;
  telephone: string;
  fax: string;
  email: string;
  fichierCIN: File | null;
  fichierRNE: File | null;
  fichierProcuration: File | null;
  fichierDossierJuridique: File | null;
  titre: string;
  description: string;
  typeSupport: string;
  categorieId: string;
  auteurs: string[];
}

const initialForm: FormState = {
  typeDeposant: "PHYSIQUE",
  nomComplet: "",
  cin: "",
  raisonSociale: "",
  registreCommerce: "",
  adresse: "",
  telephone: "",
  fax: "",
  email: "",
  fichierCIN: null,
  fichierRNE: null,
  fichierProcuration: null,
  fichierDossierJuridique: null,
  titre: "",
  description: "",
  typeSupport: "",
  categorieId: "",
  auteurs: [""],
};

const stepsInfo = [
  { num: 1, label: "Le Deposant", labelAr: "المودع" },
  { num: 2, label: "L'Oeuvre", labelAr: "المصنف" },
  { num: 3, label: "Auteur(s)", labelAr: "المؤلف(ين)" },
  { num: 4, label: "Resume", labelAr: "ملخص" },
];

const detectDir = (text: string) =>
  /[\u0600-\u06FF]/.test(text) ? "rtl" : "ltr";

const DepositPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des categories");
        return res.json();
      })
      .then((data: Category[]) => {
        setCategories(data);
        setCategoriesLoading(false);
      })
      .catch((err) => {
        setCategoriesError(err.message);
        setCategoriesLoading(false);
      });
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateFile = (field: keyof FormState, file: File | null) => {
    setForm((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateAuthor = (index: number, value: string) => {
    const updated = [...form.auteurs];
    updated[index] = value;
    setForm((prev) => ({ ...prev, auteurs: updated }));
    if (errors["auteurs"]) setErrors((prev) => ({ ...prev, auteurs: "" }));
  };

  const addAuthor = () => {
    setForm((prev) => ({ ...prev, auteurs: [...prev.auteurs, ""] }));
  };

  const removeAuthor = (index: number) => {
    if (form.auteurs.length <= 1) return;
    const updated = form.auteurs.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, auteurs: updated }));
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.typeDeposant === "PHYSIQUE") {
      if (!form.nomComplet.trim()) errs.nomComplet = "Champ obligatoire";
      if (!form.cin.trim()) errs.cin = "Champ obligatoire";
      if (!form.adresse.trim()) errs.adresse = "Champ obligatoire";
      if (!form.telephone.trim()) errs.telephone = "Champ obligatoire";
      if (!form.fichierCIN) errs.fichierCIN = "Fichier CIN obligatoire";
    } else {
      if (!form.raisonSociale.trim()) errs.raisonSociale = "Champ obligatoire";
      if (!form.registreCommerce.trim()) errs.registreCommerce = "Champ obligatoire";
      if (!form.adresse.trim()) errs.adresse = "Champ obligatoire";
      if (!form.telephone.trim()) errs.telephone = "Champ obligatoire";
      if (!form.fichierCIN) errs.fichierCIN = "Fichier CIN obligatoire";
      if (!form.fichierRNE) errs.fichierRNE = "Fichier RNE obligatoire";
      if (!form.fichierProcuration) errs.fichierProcuration = "Fichier Procuration obligatoire";
      if (!form.fichierDossierJuridique) errs.fichierDossierJuridique = "Dossier Juridique obligatoire";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.titre.trim()) errs.titre = "Champ obligatoire";
    if (!form.categorieId) errs.categorieId = "Veuillez selectionner une categorie";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = (): boolean => {
    const filled = form.auteurs.filter((a) => a.trim() !== "");
    if (filled.length === 0) {
      setErrors({ auteurs: "Au moins un auteur est obligatoire" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    let valid = false;
    if (step === 1) valid = validateStep1();
    else if (step === 2) valid = validateStep2();
    else if (step === 3) valid = validateStep3();
    if (valid) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    setSubmitting(true);
    setSubmitError("");

    const fd = new FormData();
    fd.append("typeDeposant", form.typeDeposant);
    fd.append("nomComplet", form.nomComplet);
    fd.append("cin", form.cin);
    fd.append("raisonSociale", form.raisonSociale);
    fd.append("registreCommerce", form.registreCommerce);
    fd.append("adresse", form.adresse);
    fd.append("telephone", form.telephone);
    fd.append("fax", form.fax);
    fd.append("email", form.email);
    fd.append("titre", form.titre);
    fd.append("description", form.description);
    fd.append("typeSupport", form.typeSupport);
    fd.append("categorieId", form.categorieId);
    fd.append("dateDepot", new Date().toISOString().split("T")[0]);

    form.auteurs.filter((a) => a.trim()).forEach((a, i) => {
      fd.append(`auteurs[${i}]`, a.trim());
    });

    if (form.fichierCIN) fd.append("fichierCIN", form.fichierCIN);
    if (form.fichierRNE) fd.append("fichierRNE", form.fichierRNE);
    if (form.fichierProcuration) fd.append("fichierProcuration", form.fichierProcuration);
    if (form.fichierDossierJuridique) fd.append("fichierDossierJuridique", form.fichierDossierJuridique);

    try {
      const res = await fetch("http://localhost:5000/depots", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Erreur lors de la soumission");
      navigate("/mes-depots");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => String(c.id) === form.categorieId);

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
            Formulaire de Depot
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Form title header */}
        <div className="paper-form mb-6 overflow-hidden">
          <div
            className="px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ background: "hsl(215 45% 94%)" }}
          >
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Demande de depot d'une oeuvre
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                OTDAV — Organisme Tunisien des Droits d'Auteur et des Droits Voisins
              </p>
            </div>
            <div className="text-center sm:text-right" dir="rtl">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                مطلب إيداع مصنف
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                المؤسسة التونسية لحماية حقوق المؤلفين والحقوق المجاورة
              </p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="paper-form mb-6 px-4 md:px-8 py-5">
          <div className="flex items-center justify-between">
            {stepsInfo.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step > s.num
                        ? "bg-green-500 text-white"
                        : step === s.num
                        ? "text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    style={step === s.num ? { background: "hsl(215 60% 22%)" } : undefined}
                  >
                    {step > s.num ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground mt-1.5 hidden sm:block">
                    {s.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground hidden sm:block" dir="rtl">
                    {s.labelAr}
                  </span>
                </div>
                {i < stepsInfo.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > s.num ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Le Deposant */}
        {step === 1 && (
          <div className="paper-form mb-5">
            <SectionHeader letter="A" left="Le deposant" right="المودع" />
            <div className="px-5 md:px-8 py-5 space-y-5">
              {/* Type selector */}
              <div className="flex flex-col sm:flex-row gap-3">
                <label
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.typeDeposant === "PHYSIQUE"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="typeDeposant"
                    value="PHYSIQUE"
                    checked={form.typeDeposant === "PHYSIQUE"}
                    onChange={() => updateField("typeDeposant", "PHYSIQUE")}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Personne Physique</span>
                </label>
                <label
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.typeDeposant === "MORALE"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="typeDeposant"
                    value="MORALE"
                    checked={form.typeDeposant === "MORALE"}
                    onChange={() => updateField("typeDeposant", "MORALE")}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Personne Morale / Societe</span>
                </label>
              </div>

              {/* Physique fields */}
              {form.typeDeposant === "PHYSIQUE" && (
                <>
                  <Field label="Nom et prenom" labelAr="الإسم واللقب" value={form.nomComplet}
                    onChange={(v) => updateField("nomComplet", v)} error={errors.nomComplet} required />
                  <Field label="Piece d'identite" labelAr="بطاقة الهوية" value={form.cin}
                    onChange={(v) => updateField("cin", v)} error={errors.cin} required />
                </>
              )}

              {/* Morale fields */}
              {form.typeDeposant === "MORALE" && (
                <>
                  <Field label="Raison sociale" labelAr="الإسم الجماعي" value={form.raisonSociale}
                    onChange={(v) => updateField("raisonSociale", v)} error={errors.raisonSociale} required />
                  <Field label="N. Registre de commerce" labelAr="رقم التسجيل بالدفتر التجاري" value={form.registreCommerce}
                    onChange={(v) => updateField("registreCommerce", v)} error={errors.registreCommerce} required />
                </>
              )}

              {/* Common fields */}
              <Field label="Adresse postale" labelAr="العنوان البريدي" value={form.adresse}
                onChange={(v) => updateField("adresse", v)} error={errors.adresse} required textarea />
              <Field label="N. du telephone" labelAr="رقم الهاتف" value={form.telephone}
                onChange={(v) => updateField("telephone", v)} error={errors.telephone} required />
              <Field label="N. du Fax" labelAr="رقم الفاكس" value={form.fax}
                onChange={(v) => updateField("fax", v)} />
              <Field label="E-mail @" labelAr="@ البريد الالكتروني" value={form.email}
                onChange={(v) => updateField("email", v)} />

              {/* File uploads */}
              <div className="border-t border-border pt-5 mt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Documents a joindre</h3>

                <FileField
                  label={form.typeDeposant === "MORALE" ? "CIN du representant" : "CIN"}
                  file={form.fichierCIN}
                  onChange={(f) => updateFile("fichierCIN", f)}
                  error={errors.fichierCIN}
                  required
                />

                {form.typeDeposant === "MORALE" && (
                  <>
                    <FileField label="RNE" file={form.fichierRNE}
                      onChange={(f) => updateFile("fichierRNE", f)} error={errors.fichierRNE} required />
                    <FileField label="Procuration" file={form.fichierProcuration}
                      onChange={(f) => updateFile("fichierProcuration", f)} error={errors.fichierProcuration} required />
                    <FileField label="Dossier Juridique" file={form.fichierDossierJuridique}
                      onChange={(f) => updateFile("fichierDossierJuridique", f)} error={errors.fichierDossierJuridique} required />
                  </>
                )}

                {form.typeDeposant === "PHYSIQUE" && (
                  <FileField label="Procuration (optionnel)" file={form.fichierProcuration}
                    onChange={(f) => updateFile("fichierProcuration", f)} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — L'Oeuvre */}
        {step === 2 && (
          <div className="paper-form mb-5">
            <SectionHeader letter="B" left="L'oeuvre" right="المصنف" />
            <div className="px-5 md:px-8 py-5 space-y-4">
              <Field label="Titre" labelAr="العنوان" value={form.titre}
                onChange={(v) => updateField("titre", v)} error={errors.titre} required />
              <Field label="Description sommaire" labelAr="وصف مختصر لمحتوى المصنف" value={form.description}
                onChange={(v) => updateField("description", v)} textarea />
              <Field label="Type de support" labelAr="الحاملة" value={form.typeSupport}
                onChange={(v) => updateField("typeSupport", v)} />

              {/* Category dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-start gap-2 md:gap-4">
                <label className="text-sm text-foreground font-medium md:text-right md:pt-2.5 order-1 md:order-none">
                  Categorie <span className="text-destructive">*</span>&nbsp;:
                </label>
                {categoriesError ? (
                  <p className="text-sm text-destructive order-3 md:order-none pt-2.5">{categoriesError}</p>
                ) : (
                  <div className="order-3 md:order-none">
                    <select
                      value={form.categorieId}
                      onChange={(e) => updateField("categorieId", e.target.value)}
                      disabled={categoriesLoading}
                      className={`input-field w-full ${errors.categorieId ? "border-destructive" : ""}`}
                    >
                      <option value="">
                        {categoriesLoading ? "Chargement..." : "-- Selectionner une categorie --"}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.code} - {cat.nom_fr} / {cat.nom_ar}
                        </option>
                      ))}
                    </select>
                    {errors.categorieId && (
                      <p className="text-xs text-destructive mt-1">{errors.categorieId}</p>
                    )}
                  </div>
                )}
                <label className="text-sm text-foreground font-medium md:text-left md:pt-2.5 order-2 md:order-none" dir="rtl">
                  النوع
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Auteur(s) */}
        {step === 3 && (
          <div className="paper-form mb-5">
            <SectionHeader letter="C" left="Auteur(s)" right="المؤلف(ين)" />
            <div className="px-5 md:px-8 py-5 space-y-3">
              {form.auteurs.map((author, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-6 text-center flex-shrink-0">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => updateAuthor(index, e.target.value)}
                    dir={detectDir(author)}
                    placeholder={`Nom et prenom de l'auteur ${index + 1}`}
                    className="input-field flex-1"
                  />
                  {form.auteurs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="text-destructive/60 hover:text-destructive transition-colors p-1"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {errors.auteurs && (
                <p className="text-xs text-destructive ml-9">{errors.auteurs}</p>
              )}
              <button
                type="button"
                onClick={addAuthor}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors ml-9 mt-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un auteur
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Resume */}
        {step === 4 && (
          <div className="space-y-5">
            {/* Deposant summary */}
            <div className="paper-form">
              <SectionHeader letter="A" left="Le deposant" right="المودع" />
              <div className="px-5 md:px-8 py-5 space-y-2">
                <SummaryRow label="Type" value={form.typeDeposant === "PHYSIQUE" ? "Personne Physique" : "Personne Morale"} />
                {form.typeDeposant === "PHYSIQUE" ? (
                  <>
                    <SummaryRow label="Nom et prenom" value={form.nomComplet} />
                    <SummaryRow label="Piece d'identite" value={form.cin} />
                  </>
                ) : (
                  <>
                    <SummaryRow label="Raison sociale" value={form.raisonSociale} />
                    <SummaryRow label="Registre de commerce" value={form.registreCommerce} />
                  </>
                )}
                <SummaryRow label="Adresse" value={form.adresse} />
                <SummaryRow label="Telephone" value={form.telephone} />
                {form.fax && <SummaryRow label="Fax" value={form.fax} />}
                {form.email && <SummaryRow label="Email" value={form.email} />}
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Documents joints :</p>
                  {form.fichierCIN && <SummaryRow label="CIN" value={form.fichierCIN.name} />}
                  {form.fichierRNE && <SummaryRow label="RNE" value={form.fichierRNE.name} />}
                  {form.fichierProcuration && <SummaryRow label="Procuration" value={form.fichierProcuration.name} />}
                  {form.fichierDossierJuridique && <SummaryRow label="Dossier Juridique" value={form.fichierDossierJuridique.name} />}
                </div>
              </div>
            </div>

            {/* Oeuvre summary */}
            <div className="paper-form">
              <SectionHeader letter="B" left="L'oeuvre" right="المصنف" />
              <div className="px-5 md:px-8 py-5 space-y-2">
                <SummaryRow label="Titre" value={form.titre} />
                {form.description && <SummaryRow label="Description" value={form.description} />}
                {form.typeSupport && <SummaryRow label="Support" value={form.typeSupport} />}
                <SummaryRow
                  label="Categorie"
                  value={selectedCategory ? `${selectedCategory.code} - ${selectedCategory.nom_fr} / ${selectedCategory.nom_ar}` : "—"}
                />
              </div>
            </div>

            {/* Auteurs summary */}
            <div className="paper-form">
              <SectionHeader letter="C" left="Auteur(s)" right="المؤلف(ين)" />
              <div className="px-5 md:px-8 py-5 space-y-1">
                {form.auteurs.filter((a) => a.trim()).map((a, i) => (
                  <SummaryRow key={i} label={`Auteur ${i + 1}`} value={a} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 mb-6">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Precedent
              </button>
            )}
          </div>
          <div>
            {step < 4 && (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 px-6 py-2.5"
              >
                Suivant
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary px-10 py-2.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Envoi en cours..." : "Soumettre"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


interface SectionHeaderProps {
  letter: string;
  left: string;
  right: string;
}
const SectionHeader = ({ letter, left, right }: SectionHeaderProps) => (
  <div
    className="flex items-center justify-between px-5 md:px-8 py-3.5 border-b border-border"
    style={{ background: "hsl(215 45% 94%)" }}
  >
    <div className="flex items-center gap-3">
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ background: "hsl(215 60% 22%)" }}
      >
        {letter}
      </span>
      <h2 className="text-base font-semibold text-foreground">{left}</h2>
    </div>
    <h2 className="text-base font-semibold text-foreground" dir="rtl">
      {right}
    </h2>
  </div>
);

interface FieldProps {
  label: string;
  labelAr?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  textarea?: boolean;
}
const Field = ({ label, labelAr, value, onChange, error, required, textarea }: FieldProps) => (
  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-start gap-2 md:gap-4">
    <label className="text-sm text-foreground font-medium md:text-right md:pt-2.5 order-1 md:order-none">
      {label} {required && <span className="text-destructive">*</span>}&nbsp;:
    </label>
    <div className="order-3 md:order-none">
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={detectDir(value)}
          rows={3}
          className={`input-field resize-none w-full ${error ? "border-destructive" : ""}`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={detectDir(value)}
          className={`input-field w-full ${error ? "border-destructive" : ""}`}
        />
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
    {labelAr && (
      <label className="text-sm text-foreground font-medium md:text-left md:pt-2.5 order-2 md:order-none" dir="rtl">
        {labelAr}
      </label>
    )}
  </div>
);

interface FileFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
}
const FileField = ({ label, file, onChange, error, required }: FileFieldProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
    <label className="text-sm text-foreground font-medium sm:w-48 sm:text-right flex-shrink-0">
      {label} {required && <span className="text-destructive">*</span>}&nbsp;:
    </label>
    <div className="flex-1">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="text-sm text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border
          file:text-sm file:font-medium file:bg-muted/50 file:text-foreground file:cursor-pointer
          hover:file:bg-muted transition-colors"
      />
      {file && (
        <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024).toFixed(0)} Ko)</p>
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  </div>
);

interface SummaryRowProps {
  label: string;
  value: string;
}
const SummaryRow = ({ label, value }: SummaryRowProps) => (
  <div className="flex flex-col sm:flex-row sm:gap-4 py-1.5">
    <span className="text-xs font-medium text-muted-foreground sm:w-40 sm:text-right flex-shrink-0">
      {label}&nbsp;:
    </span>
    <span className="text-sm text-foreground" dir={detectDir(value)}>
      {value || "—"}
    </span>
  </div>
);

export default DepositPage;
