import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GOUVERNORATS_DATA } from "./gouvernoratsData";

interface Category {
  id: number;
  code: number;
  nom_fr: string;
  nom_ar: string;
}

type TypeDeposant = "PHYSIQUE" | "MORALE";
type Lang = "ar" | "fr";

interface FormState {
  typeDeposant: TypeDeposant;
  nomComplet: string;
  cin: string;
  raisonSociale: string;
  registreCommerce: string;
  rue: string;
  cite: string;
  gouvernorat: string;
  delegation: string;
  codePostal: string;
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
  rue: "",
  cite: "",
  gouvernorat: "",
  delegation: "",
  codePostal: "",
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

const translations = {
  ar: {
    steps: ["المودع", "المصنف", "المؤلف(ين)", "الملخص"],
    physique: "شخص طبيعي",
    morale: "شخص معنوي",
    nomComplet: "الاسم واللقب",
    cin: "بطاقة التعريف",
    raisonSociale: "الإسم الجماعي",
    registreCommerce: "رقم السجل التجاري",
    rue: "الشارع",
    cite: "الحي",
    gouvernorat: "الولاية",
    delegation: "المعتمدية",
    codePostal: "الرمز البريدي",
    telephone: "رقم الهاتف",
    fax: "رقم الفاكس",
    email: "البريد الإلكتروني",
    fichierCIN: "بطاقة التعريف الوطنية",
    fichierCINMorale: "بطاقة التعريف الوطنية للممثل",
    fichierRNE: "السجل الوطني للمؤسسات",
    fichierProcuration: "الوكالة",
    fichierProcurationOpt: "الوكالة (اختياري)",
    fichierDossierJuridique: "الملف القانوني",
    titre: "عنوان المصنف",
    description: "وصف مختصر",
    typeSupport: "الحاملة",
    categorie: "الصنف",
    addAuthor: "أضف مؤلفاً",
    authorPlaceholder: "اسم ولقب المؤلف",
    documents: "الوثائق المطلوبة",
    next: "التالي",
    prev: "السابق",
    submit: "إرسال",
    submitting: "جاري الإرسال...",
    sectionA: "المودع",
    sectionB: "المصنف",
    sectionC: "المؤلف(ين)",
    type: "النوع",
    docsJoints: "الوثائق المرفقة :",
    formTitle: "مطلب إيداع مصنف",
    formSubtitle: "المؤسسة التونسية لحماية حقوق المؤلفين والحقوق المجاورة",
    topBarTitle: "استمارة الإيداع",
    back: "رجوع",
    selectCategory: "-- اختر صنفاً --",
    loading: "جاري التحميل...",
    personnePhysique: "شخص طبيعي",
    personneMorale: "شخص معنوي",
    auteur: "المؤلف",
    authorStatusTitle: "هل أنت المؤلف؟",
    oui: "نعم",
    non: "لا",
    coAuteur: "مؤلف مشارك",
    authorStatusError: "يرجى تحديد صفتك كمؤلف",
    errRequired: "هذا الحقل مطلوب",
    errCin: "بطاقة التعريف يجب أن تحتوي على 8 أرقام",
    errCodePostal: "الرمز البريدي يجب أن يحتوي على 4 أرقام",
    selectGouvernorat: "-- اختر الولاية --",
    selectDelegation: "-- اختر المعتمدية --",
    errTelephone: "رقم الهاتف يجب أن يحتوي على 8 أرقام",
    errEmail: "البريد الإلكتروني غير صحيح",
    errFichierCIN: "ملف بطاقة التعريف مطلوب",
    errFichierRNE: "ملف السجل الوطني مطلوب",
    errFichierProcuration: "ملف الوكالة مطلوب",
    errFichierDossierJuridique: "ملف الملف القانوني مطلوب",
  },
  fr: {
    steps: ["Deposant", "Oeuvre", "Auteur(s)", "Resume"],
    physique: "Personne Physique",
    morale: "Personne Morale",
    nomComplet: "Nom et prenom",
    cin: "Piece d'identite",
    raisonSociale: "Raison sociale",
    registreCommerce: "Registre de commerce",
    rue: "Rue",
    cite: "Cité",
    gouvernorat: "Gouvernorat",
    delegation: "Délégation",
    codePostal: "Code postal",
    telephone: "Telephone",
    fax: "Fax",
    email: "E-mail",
    fichierCIN: "Piece d'identite (CIN)",
    fichierCINMorale: "CIN du representant",
    fichierRNE: "RNE",
    fichierProcuration: "Procuration",
    fichierProcurationOpt: "Procuration (optionnel)",
    fichierDossierJuridique: "Dossier Juridique",
    titre: "Titre de l'oeuvre",
    description: "Description sommaire",
    typeSupport: "Type de support",
    categorie: "Categorie",
    addAuthor: "Ajouter un auteur",
    authorPlaceholder: "Nom et prenom de l'auteur",
    documents: "Documents a joindre",
    next: "Suivant",
    prev: "Precedent",
    submit: "Valider",
    submitting: "Envoi en cours...",
    sectionA: "Le deposant",
    sectionB: "L'oeuvre",
    sectionC: "Auteur(s)",
    type: "Type",
    docsJoints: "Documents joints :",
    formTitle: "Demande de depot d'une oeuvre",
    formSubtitle: "OTDAV — Organisme Tunisien des Droits d'Auteur et des Droits Voisins",
    topBarTitle: "Formulaire de Depot",
    back: "Retour",
    selectCategory: "-- Selectionner une categorie --",
    loading: "Chargement...",
    personnePhysique: "Personne Physique",
    personneMorale: "Personne Morale",
    auteur: "Auteur",
    authorStatusTitle: "Etes-vous l'auteur ?",
    oui: "Oui",
    non: "Non",
    coAuteur: "Co-auteur",
    authorStatusError: "Veuillez selectionner votre statut d'auteur",
    errRequired: "Ce champ est obligatoire",
    errCin: "La CIN doit contenir exactement 8 chiffres",
    errCodePostal: "Le code postal doit contenir exactement 4 chiffres",
    selectGouvernorat: "-- Sélectionner un gouvernorat --",
    selectDelegation: "-- Sélectionner une délégation --",
    errTelephone: "Le telephone doit contenir exactement 8 chiffres",
    errEmail: "L'adresse e-mail n'est pas valide",
    errFichierCIN: "Fichier CIN obligatoire",
    errFichierRNE: "Fichier RNE obligatoire",
    errFichierProcuration: "Fichier Procuration obligatoire",
    errFichierDossierJuridique: "Dossier Juridique obligatoire",
  },
};

const detectDir = (text: string) =>
  /[\u0600-\u06FF]/.test(text) ? "rtl" : "ltr";

const DepositPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("ar");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isOui, setIsOui] = useState(false);
  const [isNon, setIsNon] = useState(false);
  const [isCoAuteur, setIsCoAuteur] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [auteursCIN, setAuteursCIN] = useState<string[]>([""]);

  const T = translations[lang];
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

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

  useEffect(() => {
    const fileFields = ["fichierCIN", "fichierRNE", "fichierProcuration", "fichierDossierJuridique"] as const;
    const urls: Record<string, string> = {};
    fileFields.forEach((field) => {
      const file = form[field];
      if (file) urls[field] = URL.createObjectURL(file);
    });
    setPreviewUrls(urls);
    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.fichierCIN, form.fichierRNE, form.fichierProcuration, form.fichierDossierJuridique]);

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
    setAuteursCIN((prev) => [...prev, ""]);
  };

  const removeAuthor = (index: number) => {
    if (form.auteurs.length <= 1) return;
    const updated = form.auteurs.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, auteurs: updated }));
    setAuteursCIN((prev) => prev.filter((_, i) => i !== index));
  };

  const showProcurationPhysique = isNon && isCoAuteur;
  const isImageFile = (file: File) => /\.(jpe?g|png)$/i.test(file.name);

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    const digitRegex = /^\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const postalRegex = /^\d{4}$/;

    if (form.typeDeposant === "PHYSIQUE") {
      if (!form.nomComplet.trim()) errs.nomComplet = T.errRequired;
      if (!form.cin.trim()) errs.cin = T.errRequired;
      else if (!digitRegex.test(form.cin.trim())) errs.cin = T.errCin;
      if (!form.rue.trim()) errs.rue = T.errRequired;
      if (!form.cite.trim()) errs.cite = T.errRequired;
      if (!form.gouvernorat) errs.gouvernorat = T.errRequired;
      if (!form.delegation) errs.delegation = T.errRequired;
      if (!form.codePostal.trim()) errs.codePostal = T.errRequired;
      else if (!postalRegex.test(form.codePostal.trim())) errs.codePostal = T.errCodePostal;
      if (!form.telephone.trim()) errs.telephone = T.errRequired;
      else if (!digitRegex.test(form.telephone.trim())) errs.telephone = T.errTelephone;
      if (!form.fax.trim()) errs.fax = T.errRequired;
      if (!form.email.trim()) errs.email = T.errRequired;
      else if (!emailRegex.test(form.email.trim())) errs.email = T.errEmail;
      if (!isOui && !isNon) errs.authorStatus = T.authorStatusError;
      if (!form.fichierCIN) errs.fichierCIN = T.errFichierCIN;
      if (showProcurationPhysique && !form.fichierProcuration) errs.fichierProcuration = T.errFichierProcuration;
    } else {
      if (!form.raisonSociale.trim()) errs.raisonSociale = T.errRequired;
      if (!form.registreCommerce.trim()) errs.registreCommerce = T.errRequired;
      if (!form.rue.trim()) errs.rue = T.errRequired;
      if (!form.cite.trim()) errs.cite = T.errRequired;
      if (!form.gouvernorat) errs.gouvernorat = T.errRequired;
      if (!form.delegation) errs.delegation = T.errRequired;
      if (!form.codePostal.trim()) errs.codePostal = T.errRequired;
      else if (!postalRegex.test(form.codePostal.trim())) errs.codePostal = T.errCodePostal;
      if (!form.telephone.trim()) errs.telephone = T.errRequired;
      else if (!digitRegex.test(form.telephone.trim())) errs.telephone = T.errTelephone;
      if (!form.fax.trim()) errs.fax = T.errRequired;
      if (!form.email.trim()) errs.email = T.errRequired;
      else if (!emailRegex.test(form.email.trim())) errs.email = T.errEmail;
      if (!form.fichierCIN) errs.fichierCIN = T.errFichierCIN;
      if (!form.fichierRNE) errs.fichierRNE = T.errFichierRNE;
      if (!form.fichierProcuration) errs.fichierProcuration = T.errFichierProcuration;
      if (!form.fichierDossierJuridique) errs.fichierDossierJuridique = T.errFichierDossierJuridique;
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
    fd.append("rue", form.rue);
    fd.append("cite", form.cite);
    fd.append("gouvernorat", form.gouvernorat);
    fd.append("ville", form.delegation);
    fd.append("codePostal", form.codePostal);
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
      navigate(`/facture/${data.id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => String(c.id) === form.categorieId);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div
        className="flex-shrink-0 z-10 border-b border-border/60"
        style={{ background: "hsl(215 60% 22%)" }}
      >
        <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-lg text-white/70 font-semibold hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {T.back}
          </button>
          <h1 className="text-base font-semibold text-white tracking-tight">
            {T.topBarTitle}
          </h1>
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

      <div className="flex-1 overflow-auto max-w-[85%] mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 md:py-3" dir={dir}>
        {/* Form title header + language toggle */}
        <div className="paper-form mb-2 overflow-hidden">
          <div
            className="flex items-center justify-between gap-4 px-6 md:px-8 py-2"
            dir="ltr"
            style={{ background: "hsl(215 45% 94%)" }}
          >
            <div className={isRtl ? "text-right order-2" : "text-left order-1"}>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {T.formTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {T.formSubtitle}
              </p>
            </div>

            {/* Language toggle */}
            <div
              className={`flex items-center rounded-full p-0.5 flex-shrink-0 ${isRtl ? "order-1" : "order-2"}`}
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
        </div>

        {/* Step indicator */}
        <div className="paper-form mb-2 px-4 md:px-6 py-2">
          <div className="flex items-center justify-between" dir="ltr">
            {T.steps.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      step > i + 1
                        ? "bg-green-500 text-white"
                        : step === i + 1
                        ? "text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    style={step === i + 1 ? { background: "hsl(215 60% 22%)" } : undefined}
                  >
                    {step > i + 1 ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="font-medium text-foreground mt-1 hidden sm:block" style={{ fontSize: '13px' }}>
                    {label}
                  </span>
                </div>
                {i < T.steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > i + 1 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Deposant */}
        {step === 1 && (
          <div className="paper-form mb-4">
            <SectionHeader  title={T.sectionA} isRtl={isRtl} />
            <div className="px-6 md:px-8 py-3 space-y-2.5">
              {/* Type selector */}
              <div className="flex flex-col sm:flex-row gap-2">
                <label
                  className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 cursor-pointer transition-colors ${
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
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span className="font-medium text-foreground" style={{ fontSize: '15px' }}>{T.physique}</span>
                </label>
                <label
                  className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 cursor-pointer transition-colors ${
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
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span className="font-medium text-foreground" style={{ fontSize: '15px' }}>{T.morale}</span>
                </label>
              </div>

              {/* Physique fields */}
              {form.typeDeposant === "PHYSIQUE" && (
                <>
                  <Field label={T.nomComplet} value={form.nomComplet}
                    onChange={(v) => updateField("nomComplet", v)} error={errors.nomComplet} required isRtl={isRtl} />
                  <Field label={T.cin} value={form.cin}
                    onChange={(v) => updateField("cin", v)} error={errors.cin} required isRtl={isRtl} />
                </>
              )}

              {/* Morale fields */}
              {form.typeDeposant === "MORALE" && (
                <>
                  <Field label={T.raisonSociale} value={form.raisonSociale}
                    onChange={(v) => updateField("raisonSociale", v)} error={errors.raisonSociale} required isRtl={isRtl} />
                  <Field label={T.registreCommerce} value={form.registreCommerce}
                    onChange={(v) => updateField("registreCommerce", v)} error={errors.registreCommerce} required isRtl={isRtl} />
                </>
              )}

              {/* Address fields */}
              <Field label={T.rue} value={form.rue}
                onChange={(v) => updateField("rue", v)} error={errors.rue} required isRtl={isRtl} />

              {/* Cité & Code postal — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <label className={`text-foreground font-medium whitespace-nowrap pt-2 w-[100px] flex-shrink-0 ${isRtl ? "text-right" : "text-left"}`} style={{ fontSize: '17px' }}>
                    {T.cite} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex-1 min-w-0">
                    <input type="text" value={form.cite} onChange={(e) => updateField("cite", e.target.value)}
                      dir={detectDir(form.cite)} className={`input-field w-full ${errors.cite ? "border-destructive" : ""}`} style={{ fontSize: '14px' }} />
                    {errors.cite && <p className="text-destructive mt-1" style={{ fontSize: '13px' }}>{errors.cite}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <label className={`text-foreground font-medium whitespace-nowrap pt-2 w-[100px] flex-shrink-0 ${isRtl ? "text-right" : "text-left"}`} style={{ fontSize: '17px' }}>
                    {T.codePostal} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex-1 min-w-0">
                    <input type="text" value={form.codePostal} onChange={(e) => updateField("codePostal", e.target.value)}
                      dir={detectDir(form.codePostal)} className={`input-field w-full ${errors.codePostal ? "border-destructive" : ""}`} style={{ fontSize: '14px' }} />
                    {errors.codePostal && <p className="text-destructive mt-1" style={{ fontSize: '13px' }}>{errors.codePostal}</p>}
                  </div>
                </div>
              </div>

              {/* Gouvernorat & Délégation — side by side */}
              <div className="flex justify-center gap-6">
                <div className="flex items-start gap-2 w-[45%]">
                  <label className={`text-foreground font-medium whitespace-nowrap pt-2 w-[100px] flex-shrink-0 ${isRtl ? "text-right" : "text-left"}`} style={{ fontSize: '17px' }}>
                    {T.gouvernorat} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex-1 min-w-0">
                    <select
                      value={form.gouvernorat}
                      onChange={(e) => {
                        updateField("gouvernorat", e.target.value);
                        updateField("delegation", "");
                      }}
                      className={`input-field w-full ${errors.gouvernorat ? "border-destructive" : ""}`}
                      dir="ltr"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="">{T.selectGouvernorat}</option>
                      {GOUVERNORATS_DATA.map((g) => (
                        <option key={g.fr} value={g.fr}>
                          {lang === "ar" ? g.ar : g.fr}
                        </option>
                      ))}
                    </select>
                    {errors.gouvernorat && <p className="text-destructive mt-1" style={{ fontSize: '13px' }}>{errors.gouvernorat}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-2 w-[45%]">
                  <label className={`text-foreground font-medium whitespace-nowrap pt-2 w-[100px] flex-shrink-0 ${isRtl ? "text-right" : "text-left"}`} style={{ fontSize: '17px' }}>
                    {T.delegation} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex-1 min-w-0">
                    <select
                      value={form.delegation}
                      onChange={(e) => updateField("delegation", e.target.value)}
                      className={`input-field w-full ${errors.delegation ? "border-destructive" : ""}`}
                      dir="ltr"
                      disabled={!form.gouvernorat}
                      style={{ fontSize: '14px' }}
                    >
                      <option value="">{T.selectDelegation}</option>
                      {GOUVERNORATS_DATA
                        .find((g) => g.fr === form.gouvernorat)
                        ?.delegations.map((d) => {
                          const frVal = typeof d.fr === 'string' ? d.fr : d.fr.nom;
                          const arVal = typeof d.ar === 'string' ? d.ar : d.ar.nom;
                          return (
                            <option key={frVal} value={frVal}>
                              {lang === "ar" ? arVal : frVal}
                            </option>
                          );
                        })}
                    </select>
                    {errors.delegation && <p className="text-destructive mt-1" style={{ fontSize: '13px' }}>{errors.delegation}</p>}
                  </div>
                </div>
              </div>

              {/* Common fields */}
              <Field label={T.telephone} value={form.telephone}
                onChange={(v) => updateField("telephone", v)} error={errors.telephone} required isRtl={isRtl} />
              <Field label={T.fax} value={form.fax}
                onChange={(v) => updateField("fax", v)} error={errors.fax} required isRtl={isRtl} />
              <Field label={T.email} value={form.email}
                onChange={(v) => updateField("email", v)} error={errors.email} required isRtl={isRtl} />

              {/* Author status checkboxes — Physique only */}
              {form.typeDeposant === "PHYSIQUE" && (
                <div className="border-t border-border pt-2 mt-2">
                  <h3 className="font-medium text-foreground mb-1.5" style={{ fontSize: '17px' }}>{T.authorStatusTitle}</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOui}
                        onChange={() => { setIsOui(true); setIsNon(false); }}
                        className="accent-primary"
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span className="text-foreground" style={{ fontSize: '15px' }}>{T.oui}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNon}
                        onChange={() => { setIsNon(true); setIsOui(false); }}
                        className="accent-primary"
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span className="text-foreground" style={{ fontSize: '15px' }}>{T.non}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCoAuteur}
                        onChange={() => setIsCoAuteur(!isCoAuteur)}
                        className="accent-primary"
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span className="text-foreground" style={{ fontSize: '15px' }}>{T.coAuteur}</span>
                    </label>
                  </div>
                  {errors.authorStatus && (
                    <p className="text-destructive mt-1.5" style={{ fontSize: '13px' }}>{errors.authorStatus}</p>
                  )}
                </div>
              )}

              {/* File uploads */}
              <div className="border-t border-border pt-2 mt-2">
                <h3 className="font-medium text-foreground mb-2" style={{ fontSize: '17px' }}>{T.documents}</h3>

                {form.typeDeposant === "PHYSIQUE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <FileField
                      label={T.fichierCIN}
                      file={form.fichierCIN}
                      onChange={(f) => updateFile("fichierCIN", f)}
                      error={errors.fichierCIN}
                      required
                    />
                    {showProcurationPhysique && (
                      <FileField label={T.fichierProcuration} file={form.fichierProcuration}
                        onChange={(f) => updateFile("fichierProcuration", f)} error={errors.fichierProcuration} required />
                    )}
                  </div>
                )}

                {form.typeDeposant === "MORALE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <FileField
                      label={T.fichierCINMorale}
                      file={form.fichierCIN}
                      onChange={(f) => updateFile("fichierCIN", f)}
                      error={errors.fichierCIN}
                      required
                    />
                    <FileField label={T.fichierRNE} file={form.fichierRNE}
                      onChange={(f) => updateFile("fichierRNE", f)} error={errors.fichierRNE} required />
                    <FileField label={T.fichierProcuration} file={form.fichierProcuration}
                      onChange={(f) => updateFile("fichierProcuration", f)} error={errors.fichierProcuration} required />
                    <FileField label={T.fichierDossierJuridique} file={form.fichierDossierJuridique}
                      onChange={(f) => updateFile("fichierDossierJuridique", f)} error={errors.fichierDossierJuridique} required />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Oeuvre */}
        {step === 2 && (
          <div className="paper-form mb-4">
            <SectionHeader  title={T.sectionB} isRtl={isRtl} />
            <div className="px-5 md:px-8 py-3 space-y-3">
              <Field label={T.titre} value={form.titre}
                onChange={(v) => updateField("titre", v)} error={errors.titre} required isRtl={isRtl} />
              <Field label={T.description} value={form.description}
                onChange={(v) => updateField("description", v)} textarea required isRtl={isRtl} />
              <Field label={T.typeSupport} value={form.typeSupport}
                onChange={(v) => updateField("typeSupport", v)} required isRtl={isRtl} />

              {/* Category dropdown */}
              <div className={`grid grid-cols-1 md:grid-cols-[auto_1fr] items-start gap-2 md:gap-4`}>
                <label className={`text-foreground font-medium md:pt-2.5 ${isRtl ? "md:text-right" : "md:text-left"}`} style={{ fontSize: '17px' }}>
                  {T.categorie} <span className="text-destructive">*</span>
                </label>
                {categoriesError ? (
                  <p className="text-destructive pt-2.5" style={{ fontSize: '13px' }}>{categoriesError}</p>
                ) : (
                  <div>
                    <select
                      value={form.categorieId}
                      onChange={(e) => updateField("categorieId", e.target.value)}
                      disabled={categoriesLoading}
                      className={`input-field w-full max-w-sm ${errors.categorieId ? "border-destructive" : ""}`}
                      dir="ltr"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="">
                        {categoriesLoading ? T.loading : T.selectCategory}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.code} - {cat.nom_fr} / {cat.nom_ar}
                        </option>
                      ))}
                    </select>
                    {errors.categorieId && (
                      <p className="text-destructive mt-1" style={{ fontSize: '13px' }}>{errors.categorieId}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Auteur(s) */}
        {step === 3 && (
          <div className="paper-form mb-4">
            <SectionHeader title={T.sectionC} isRtl={isRtl} />
            <div className="px-5 md:px-8 py-3 space-y-2">
              {form.auteurs.map((author, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="font-medium text-muted-foreground w-6 text-center flex-shrink-0" style={{ fontSize: '13px' }}>
                    {index + 1}.
                  </span>
                  {isNon && isCoAuteur ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => updateAuthor(index, e.target.value)}
                        dir={detectDir(author)}
                        placeholder={`${T.authorPlaceholder} ${index + 1}`}
                        className="input-field"
                        style={{ width: "60%", fontSize: '14px' }}
                      />
                      <input
                        type="text"
                        value={auteursCIN[index] || ""}
                        onChange={(e) => {
                          const updated = [...auteursCIN];
                          updated[index] = e.target.value;
                          setAuteursCIN(updated);
                        }}
                        dir="ltr"
                        placeholder="CIN"
                        className="input-field"
                        style={{ width: "40%", fontSize: '14px' }}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => updateAuthor(index, e.target.value)}
                      dir={detectDir(author)}
                      placeholder={`${T.authorPlaceholder} ${index + 1}`}
                      className="input-field flex-1"
                      style={{ fontSize: '14px' }}
                    />
                  )}
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
                <p className="text-destructive" style={{ fontSize: '13px', marginInlineStart: "2.25rem" }}>{errors.auteurs}</p>
              )}
              <button
                type="button"
                onClick={addAuthor}
                className="flex items-center gap-1.5 text-primary font-medium hover:text-primary/80 transition-colors mt-1"
                style={{ fontSize: '15px', marginInlineStart: "2.25rem" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {T.addAuthor}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Resume */}
        {step === 4 && (
          <div className="space-y-3">
            {/* Deposant summary */}
            <div className="paper-form">
              <SectionHeader title={T.sectionA} isRtl={isRtl} />
              <div className="px-5 md:px-8 py-3 space-y-1">
                <SummaryRow label={T.type} value={form.typeDeposant === "PHYSIQUE" ? T.personnePhysique : T.personneMorale} isRtl={isRtl} />
                {form.typeDeposant === "PHYSIQUE" ? (
                  <>
                    <SummaryRow label={T.nomComplet} value={form.nomComplet} isRtl={isRtl} />
                    <SummaryRow label={T.cin} value={form.cin} isRtl={isRtl} />
                  </>
                ) : (
                  <>
                    <SummaryRow label={T.raisonSociale} value={form.raisonSociale} isRtl={isRtl} />
                    <SummaryRow label={T.registreCommerce} value={form.registreCommerce} isRtl={isRtl} />
                  </>
                )}
                <SummaryRow label={T.rue} value={form.rue} isRtl={isRtl} />
                <SummaryRow label={T.cite} value={form.cite} isRtl={isRtl} />
                <SummaryRow label={T.gouvernorat} value={form.gouvernorat} isRtl={isRtl} />
                <SummaryRow label={T.delegation} value={form.delegation} isRtl={isRtl} />
                <SummaryRow label={T.codePostal} value={form.codePostal} isRtl={isRtl} />
                <SummaryRow label={T.telephone} value={form.telephone} isRtl={isRtl} />
                {form.fax && <SummaryRow label={T.fax} value={form.fax} isRtl={isRtl} />}
                {form.email && <SummaryRow label={T.email} value={form.email} isRtl={isRtl} />}
                <div className="border-t border-border pt-3 mt-3">
                  <p className="font-medium text-muted-foreground mb-1" style={{ fontSize: '17px' }}>{T.docsJoints}</p>
                  {([
                    ["fichierCIN", "CIN"],
                    ["fichierRNE", "RNE"],
                    ["fichierProcuration", T.fichierProcuration],
                    ["fichierDossierJuridique", T.fichierDossierJuridique],
                  ] as const).map(([field, label]) => {
                    const file = form[field];
                    const url = previewUrls[field];
                    if (!file || !url) return null;
                    return (
                      <div key={field} className={`flex flex-col sm:flex-row sm:gap-4 py-1.5 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
                        <span className={`font-medium text-muted-foreground sm:w-40 flex-shrink-0 ${isRtl ? "sm:text-left" : "sm:text-right"}`} style={{ fontSize: '17px' }}>
                          {label}
                        </span>
                        {isImageFile(file) ? (
                          <img
                            src={url}
                            alt={file.name}
                            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "4px", cursor: "pointer" }}
                            onClick={() => window.open(url)}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => window.open(url)}
                            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                            style={{ fontSize: '14px' }}
                          >
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                            </svg>
                            {file.name}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Oeuvre summary */}
            <div className="paper-form">
              <SectionHeader title={T.sectionB} isRtl={isRtl} />
              <div className="px-5 md:px-8 py-3 space-y-1">
                <SummaryRow label={T.titre} value={form.titre} isRtl={isRtl} />
                {form.description && <SummaryRow label={T.description} value={form.description} isRtl={isRtl} />}
                {form.typeSupport && <SummaryRow label={T.typeSupport} value={form.typeSupport} isRtl={isRtl} />}
                <SummaryRow
                  label={T.categorie}
                  value={selectedCategory ? `${selectedCategory.code} - ${selectedCategory.nom_fr} / ${selectedCategory.nom_ar}` : "\u2014"}
                  isRtl={isRtl}
                />
              </div>
            </div>

            {/* Auteurs summary */}
            <div className="paper-form">
              <SectionHeader title={T.sectionC} isRtl={isRtl} />
              <div className="px-5 md:px-8 py-3 space-y-1">
                {form.auteurs
                  .map((a, i) => [a, i] as const)
                  .filter(([a]) => a.trim())
                  .map(([a, origIdx], i) => (
                    <div key={origIdx}>
                      <SummaryRow label={`${T.auteur} ${i + 1}`} value={a} isRtl={isRtl} />
                      {isNon && isCoAuteur && auteursCIN[origIdx]?.trim() && (
                        <SummaryRow label="CIN" value={auteursCIN[origIdx]} isRtl={isRtl} />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive" style={{ fontSize: '13px' }}>
            {submitError}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-2 mb-2" dir="ltr">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted/50 transition-colors"
                style={{ fontSize: '15px' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {T.prev}
              </button>
            )}
          </div>
          <div>
            {step < 4 && (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 px-6 py-2.5"
                style={{ fontSize: '15px' }}
              >
                {T.next}
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
                className="btn-primary px-10 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: '15px' }}
              >
                {submitting ? T.submitting : T.submit}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


interface SectionHeaderProps {
  title: string;
  isRtl: boolean;
}
const SectionHeader = ({  title, isRtl }: SectionHeaderProps) => (
  <div
    className={`flex items-center gap-2 px-6 md:px-8 py-4 border-b border-border underline${isRtl ? "flex-row-reverse" : ""}`}
    style={{ background: "hsl(215 45% 94%)" }}
  >
    <h2 className="font-bold text-foreground" style={{ fontSize: '20px' }}>{title}</h2>
  </div>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  textarea?: boolean;
  isRtl: boolean;
}
const Field = ({ label, value, onChange, error, required, textarea, isRtl }: FieldProps) => (
  <div className="flex items-start gap-3">
    <label className={`text-foreground font-medium whitespace-nowrap pt-2 w-[160px] flex-shrink-0 ${isRtl ? "text-right" : "text-left"}`} style={{ fontSize: '17px' }}>
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <div className="flex-1 min-w-0">
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={detectDir(value)}
          rows={3}
          className={`input-field resize-none w-full ${error ? "border-destructive" : ""}`}
          style={{ fontSize: '14px' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={detectDir(value)}
          className={`input-field w-full ${error ? "border-destructive" : ""}`}
          style={{ fontSize: '14px' }}
        />
      )}
      {error && <p className="text-destructive mt-1" style={{ fontSize: '13px' }}>{error}</p>}
    </div>
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
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
    <label className="text-foreground font-medium flex-shrink-0" style={{ fontSize: '17px' }}>
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <div className="flex-1">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border
          file:font-medium file:bg-muted/50 file:text-foreground file:cursor-pointer
          hover:file:bg-muted transition-colors"
        style={{ fontSize: '14px' }}
        dir="ltr"
      />
      {file && (
        <p className="text-muted-foreground mt-1" style={{ fontSize: '13px' }}>{file.name} ({(file.size / 1024).toFixed(0)} Ko)</p>
      )}
      {error && <p className="text-destructive mt-1" style={{ fontSize: '13px' }}>{error}</p>}
    </div>
  </div>
);

interface SummaryRowProps {
  label: string;
  value: string;
  isRtl: boolean;
}
const SummaryRow = ({ label, value, isRtl }: SummaryRowProps) => (
  <div className={`flex flex-col sm:flex-row sm:gap-4 py-1.5 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
    <span className={`font-medium text-muted-foreground sm:w-40 flex-shrink-0 ${isRtl ? "sm:text-left" : "sm:text-right"}`} style={{ fontSize: '17px' }}>
      {label}
    </span>
    <span className="text-foreground" dir={detectDir(value)} style={{ fontSize: '14px' }}>
      {value || "\u2014"}
    </span>
  </div>
);

export default DepositPage;
