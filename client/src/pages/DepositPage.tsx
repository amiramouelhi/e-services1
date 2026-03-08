import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  code: number;
  nom_fr: string;
  nom_ar: string;
}

const DepositPage = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([""]);
  const [referenceFacture, setReferenceFacture] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const addAuthor = () => {
    setAuthors([...authors, ""]);
  };

  const updateAuthor = (index: number, value: string) => {
    const updated = [...authors];
    updated[index] = value;
    setAuthors(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const formData = new FormData(e.currentTarget);

    const body = {
      nomComplet: formData.get("nomComplet") as string,
      cin: formData.get("cin") as string,
      raisonSociale: formData.get("raisonSociale") as string,
      registreCommerce: formData.get("registreCommerce") as string,
      adresse: formData.get("adresse") as string,
      telephone: formData.get("telephone") as string,
      fax: formData.get("fax") as string,
      email: formData.get("email") as string,
      titre: formData.get("titre") as string,
      description: formData.get("description") as string,
      typeSupport: formData.get("typeSupport") as string,
      categorieId: Number(categorieId),
      auteurs: authors.filter((a) => a.trim() !== ""),
      dateDepot: new Date().toISOString().split("T")[0],
    };

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/depots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la soumission");
      }
      setSubmitSuccess(`Dépôt enregistré avec succès (ID: ${data.id})`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
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
            Formulaire de Dépôt
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Form title header — paper style */}
        <div className="paper-form mb-6 overflow-hidden">
          <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ background: "hsl(215 45% 94%)" }}
          >
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Demande de dépôt d'une œuvre
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

        <form onSubmit={handleSubmit}>
          {/* Section A — Le déposant / المودع */}
          <div className="paper-form mb-5">
            <SectionHeader letter="A" left="Le déposant" right="المودع" />
            <div className="px-5 md:px-8 py-5 space-y-4">
              <BilingualField labelFr="Nom et prénom" labelAr="الإسم واللقب" name="nomComplet" />
              <BilingualField labelFr="Pièce d'identité" labelAr="بطاقة الهوية" name="cin" />
              <BilingualField labelFr="Raison sociale" labelAr="الإسم الحمائي" name="raisonSociale" />
              <BilingualField
                labelFr="N° lieu et date d'enregistrement au registre de commerce"
                labelAr="رقم و مكان و تاريخ التسجيل بالدفتر التجاري"
                name="registreCommerce"
              />
              <BilingualField labelFr="Adresse postale" labelAr="العنوان البريدي" textarea name="adresse" />
              <BilingualField labelFr="N° du téléphone" labelAr="رقم الهاتف" name="telephone" />
              <BilingualField labelFr="N° du Fax" labelAr="رقم الفاكس" name="fax" />
              <BilingualField labelFr="E-mail @" labelAr="@ البريد الالكتروني" name="email" />
            </div>
          </div>

          {/* Section B — Auteur(s) / المؤلف(ين) */}
          <div className="paper-form mb-5">
            <SectionHeader letter="B" left="Auteur(s)" right="المؤلف(ين)" />
            <div className="px-5 md:px-8 py-5 space-y-3">
              {authors.map((author, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-6 text-center flex-shrink-0">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => updateAuthor(index, e.target.value)}
                    placeholder={`Nom et prénom de l'auteur ${index + 1}`}
                    className="input-field"
                  />
                </div>
              ))}
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

          {/* Section C — L'œuvre / المصنف */}
          <div className="paper-form mb-5">
            <SectionHeader letter="C" left="L'œuvre" right="المصنف" />
            <div className="px-5 md:px-8 py-5 space-y-4">
              <BilingualField labelFr="Titre" labelAr="العنوان" name="titre" />
              <BilingualField
                labelFr="Description sommaire du contenu de l'œuvre"
                labelAr="وصف مختصر لمحتوى المصنف"
                textarea
                name="description"
              />
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-start gap-2 md:gap-4">
                <label className="text-sm text-foreground font-medium md:text-right md:pt-2.5 order-1 md:order-none">
                  Genre n°&nbsp;:
                </label>
                {categoriesError ? (
                  <p className="text-sm text-destructive order-3 md:order-none pt-2.5">{categoriesError}</p>
                ) : (
                  <select
                    value={categorieId}
                    onChange={(e) => setCategorieId(e.target.value)}
                    disabled={categoriesLoading}
                    className="input-field order-3 md:order-none"
                  >
                    <option value="">
                      {categoriesLoading ? "Chargement..." : "— Sélectionner une catégorie —"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.code} - {cat.nom_fr} / {cat.nom_ar}
                      </option>
                    ))}
                  </select>
                )}
                <label className="text-sm text-foreground font-medium md:text-left md:pt-2.5 order-2 md:order-none" dir="rtl">
                  النوع/رقم
                </label>
              </div>
              <BilingualField labelFr="Support" labelAr="الحاملة" name="typeSupport" />
            </div>
          </div>

          {/* Feedback messages */}
          {submitError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
              {submitSuccess}
            </div>
          )}

          {/* Validate */}
          <div className="flex justify-end mb-6">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-10 py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Envoi en cours..." : "Valider le dépôt"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

{/* interface will be added to types latr */}
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

{/* interface will be added to types latr */}
interface BilingualFieldProps {
  labelFr: string;
  labelAr: string;
  textarea?: boolean;
  name?: string;
}
const BilingualField = ({ labelFr, labelAr, textarea = false, name }: BilingualFieldProps) => (
  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-start gap-2 md:gap-4">
    <label className="text-sm text-foreground font-medium md:text-right md:pt-2.5 order-1 md:order-none">
      {labelFr}&nbsp;:
    </label>
    {textarea ? (
      <textarea
        name={name}
        rows={3}
        className="input-field resize-none order-3 md:order-none"
      />
    ) : (
      <input
        name={name}
        type="text"
        className="input-field order-3 md:order-none"
      />
    )}
    <label className="text-sm text-foreground font-medium md:text-left md:pt-2.5 order-2 md:order-none" dir="rtl">
      {labelAr}
    </label>
  </div>
);

export default DepositPage;
