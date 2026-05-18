import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

type Lang = "ar" | "fr";

// ── Types ──────────────────────────────────────────────────────────
type QualiteOption = {
  value: string;
  label: string;
};

interface ExpenseRow {
  montant: string;
  fichier: File | null;
}

const EXPENSE_KEYS = [
  "contratArtiste",
  "contratGroupe",
  "transportInt",
  "transportInterne",
  "organisateur",
  "hebergement",
  "decorEclairage",
  "contratLocation",
  "autres",
] as const;
type ExpenseKey = (typeof EXPENSE_KEYS)[number];
type ExpensesState = Record<ExpenseKey, ExpenseRow>;

const makeExpenses = (): ExpensesState =>
  Object.fromEntries(EXPENSE_KEYS.map((k) => [k, { montant: "", fichier: null }])) as ExpensesState;

export const EXPENSE_LABELS: Record<ExpenseKey, { ar: string; fr: string }> = {
  contratArtiste:   { ar: "عقد الفنان",        fr: "Contrat de l'artiste" },
  contratGroupe:    { ar: "عقد الفرقة",         fr: "Contrat du groupe" },
  transportInt:     { ar: "التنقل الدولي",       fr: "Transport international" },
  transportInterne: { ar: "التنقل الداخلي",      fr: "Transport interne" },
  organisateur:     { ar: "متعهد الحفلات",       fr: "Organisateur de spectacles" },
  hebergement:      { ar: "الإقامة",             fr: "Hébergement" },
  decorEclairage:   { ar: "الديكور / الإضاءة",  fr: "Décor / Éclairage" },
  contratLocation:  { ar: "عقد كراء الفضاء",    fr: "Contrat de location d'espace" },
  autres:           { ar: "أخرى",               fr: "Autres" },
};

// Artist-specific expense keys — shown only when artist is foreign (nationality === "autre")
const ARTIST_EXPENSE_KEYS = [
  "remunerationArtistes",
  "remunerationGroupes",
  "remunerationOrganisateur",
  "deplacements",
  "hebergement",
  "avantagesNature",
  "prestation1",
  "prestation2",
  "prestation3",
  "locationSalle",
  "son",
  "eclairage",
  "decor",
  "billetterie",
] as const;
type ArtistExpenseKey = (typeof ARTIST_EXPENSE_KEYS)[number];
type ArtistExpensesState = Record<ArtistExpenseKey, ExpenseRow>;

// Tunisian artists only show artist fee, accompanying groups fee and hall rental
const ARTIST_TUNISIAN_KEYS: ArtistExpenseKey[] = [
  "remunerationArtistes",
  "remunerationGroupes",
  "locationSalle",
];

const makeArtistExpenses = (): ArtistExpensesState =>
  Object.fromEntries(ARTIST_EXPENSE_KEYS.map((k) => [k, { montant: "", fichier: null }])) as ArtistExpensesState;

const ARTIST_EXPENSE_LABELS: Record<ArtistExpenseKey, { ar: string; fr: string }> = {
  remunerationArtistes:     { ar: "أجرة الفنانين",                  fr: "Rémunération des artistes" },
  remunerationGroupes:      { ar: "أجرة الفرق المصاحبة",            fr: "Rémunération des groupes d'accompagnement" },
  remunerationOrganisateur: { ar: "أجرة متعهد الحفلات",             fr: "Rémunération de l'organisateur de spectacles" },
  deplacements:             { ar: "التنقلات",                       fr: "Déplacements" },
  hebergement:              { ar: "الإقامة",                        fr: "Hébergement" },
  avantagesNature:          { ar: "الامتيازات العينية",             fr: "Avantages en nature" },
  prestation1:              { ar: "أداء 1",                         fr: "Prestation 1" },
  prestation2:              { ar: "أداء 2",                         fr: "Prestation 2" },
  prestation3:              { ar: "أداء 3",                         fr: "Prestation 3" },
  locationSalle:            { ar: "معلوم كراء القاعة أو الفضاء",    fr: "Frais de location de salle ou d'espace" },
  son:                      { ar: "الصوت",                          fr: "Son" },
  eclairage:                { ar: "الإضاءة",                        fr: "Éclairage" },
  decor:                    { ar: "الديكور",                        fr: "Décor" },
  billetterie:              { ar: "التذكير",                        fr: "Billetterie" },
};

interface ArtistRow {
  name: string;
  nationality: "tunisienne" | "autre";
  country: string;
  identityFile: File | null;
  expenses: ArtistExpensesState;
}

interface SpectacleState {
  categorieSpectacle: string;
  titreSpectacle: string;
  espaceSpectacle: string;
  nombreArtistes: string;
  artists: ArtistRow[];
  dateSpectacle: string;
  heureSpectacle: string;
  lieuSpectacle: string;
  typeSpectacle: "individuel" | "manifestation" | "";
  nomManifestation: string;
  budget: string;
  natureTazahora: "internationale" | "locale" | "nationale" | "regional" | "";
  hasForeignShows: "oui" | "non" | "";
  expenses: ExpensesState;
}

interface FormState {
  numeroAutorisation: string;
  dateDemandeAutorisation: string;
  isOrganisateur: boolean;
  qualite: string;
  hasArtistesEtrangers: boolean;
  dateCommission: string;
  pvFile: File | null;
}

// ── Factories ──────────────────────────────────────────────────────

const makeArtist = (): ArtistRow => ({
  name: "",
  nationality: "tunisienne",
  country: "",
  identityFile: null,
  expenses: makeArtistExpenses(),
});

const makeArtists = (n: number): ArtistRow[] => Array.from({ length: n }, makeArtist);

const makeSpectacle = (): SpectacleState => ({
  categorieSpectacle: "",
  titreSpectacle: "",
  espaceSpectacle: "",
  nombreArtistes: "1",
  artists: makeArtists(1),
  dateSpectacle: "",
  heureSpectacle: "",
  lieuSpectacle: "",
  typeSpectacle: "",
  nomManifestation: "",
  budget: "",
  natureTazahora: "",
  hasForeignShows: "",
  expenses: makeExpenses(),
});

const makeSpectacles = (n: number): SpectacleState[] => Array.from({ length: n }, makeSpectacle);

const initial: FormState = {
  numeroAutorisation: "",
  dateDemandeAutorisation: "",
  isOrganisateur: false,
  qualite: "",
  hasArtistesEtrangers: false,
  dateCommission: "",
  pvFile: null,
};

const SPECTACLE_COLORS = [
  { border: "hsl(215 45% 80%)", header: "hsl(215 45% 90%)" },
  { border: "#f97316",          header: "#fff7ed" },
  { border: "#10b981",          header: "#f0fdf4" },
];

const COUNTRIES: { fr: string; ar: string }[] = [
  { fr: "Algérie", ar: "الجزائر" },
  { fr: "Maroc", ar: "المغرب" },
  { fr: "Libye", ar: "ليبيا" },
  { fr: "Égypte", ar: "مصر" },
  { fr: "France", ar: "فرنسا" },
  { fr: "Italie", ar: "إيطاليا" },
  { fr: "Espagne", ar: "إسبانيا" },
  { fr: "Allemagne", ar: "ألمانيا" },
  { fr: "Royaume-Uni", ar: "المملكة المتحدة" },
  { fr: "États-Unis", ar: "الولايات المتحدة" },
  { fr: "Turquie", ar: "تركيا" },
  { fr: "Arabie Saoudite", ar: "المملكة العربية السعودية" },
  { fr: "Émirats Arabes Unis", ar: "الإمارات العربية المتحدة" },
  { fr: "Qatar", ar: "قطر" },
  { fr: "Jordanie", ar: "الأردن" },
  { fr: "Liban", ar: "لبنان" },
  { fr: "Syrie", ar: "سوريا" },
  { fr: "Irak", ar: "العراق" },
  { fr: "Koweït", ar: "الكويت" },
  { fr: "Bahreïn", ar: "البحرين" },
  { fr: "Oman", ar: "عُمان" },
  { fr: "Yémen", ar: "اليمن" },
  { fr: "Soudan", ar: "السودان" },
  { fr: "Mauritanie", ar: "موريتانيا" },
  { fr: "Sénégal", ar: "السنغال" },
  { fr: "Mali", ar: "مالي" },
  { fr: "Niger", ar: "النيجر" },
  { fr: "Tchad", ar: "تشاد" },
  { fr: "Cameroun", ar: "الكاميرون" },
  { fr: "Côte d'Ivoire", ar: "ساحل العاج" },
  { fr: "Ghana", ar: "غانا" },
  { fr: "Nigeria", ar: "نيجيريا" },
  { fr: "Ethiopie", ar: "إثيوبيا" },
  { fr: "Kenya", ar: "كينيا" },
  { fr: "Afrique du Sud", ar: "جنوب أفريقيا" },
  { fr: "Russie", ar: "روسيا" },
  { fr: "Chine", ar: "الصين" },
  { fr: "Japon", ar: "اليابان" },
  { fr: "Inde", ar: "الهند" },
  { fr: "Brésil", ar: "البرازيل" },
  { fr: "Canada", ar: "كندا" },
  { fr: "Australie", ar: "أستراليا" },
  { fr: "Portugal", ar: "البرتغال" },
  { fr: "Belgique", ar: "بلجيكا" },
  { fr: "Suisse", ar: "سويسرا" },
  { fr: "Pays-Bas", ar: "هولندا" },
  { fr: "Suède", ar: "السويد" },
  { fr: "Norvège", ar: "النرويج" },
  { fr: "Danemark", ar: "الدنمارك" },
  { fr: "Finlande", ar: "فنلندا" },
  { fr: "Pologne", ar: "بولندا" },
  { fr: "Grèce", ar: "اليونان" },
  { fr: "Argentine", ar: "الأرجنتين" },
  { fr: "Mexique", ar: "المكسيك" },
  { fr: "Indonésie", ar: "إندونيسيا" },
  { fr: "Pakistan", ar: "باكستان" },
  { fr: "Bangladesh", ar: "بنغلاديش" },
  { fr: "Iran", ar: "إيران" },
  { fr: "Afghanistan", ar: "أفغانستان" },
];

const T = {
  ar: {
    topBarTitle: "تراخيص",
    back: "رجوع",
    formTitle: "طلب ترخيص عرض",
    formSubtitle: "المؤسسة التونسية لحماية حقوق المؤلفين والحقوق المجاورة",
    sectionTitle: ": طالب الترخيص",
    numeroAutorisation: "رقم المطلب",
    dateDemande: "تاريخ الطلب",
    heureSpectacle: "توقيت العرض",
    organisateur: "متعهد حفلات",
    qualite: "الصفة",
    qualites: [
  { value: "espace_touristique", label: "فضاء سياحي" },
  { value: "salle_fetes", label: "قاعة أفراح" },
  { value: "salle_sport", label: "قاعة رياضة" },
  { value: "cafes_restaurants", label: "مقاهي + مطاعم" },
  { value: "transport", label: "وسائل نقل" },
  { value: "structure_publique", label: "هيكل عمومي" },
],
    qualitePlaceholder: "-- اختر الصفة --",
    choisirOrganisateur: "اختر المتعهد",
    ajouterOrganisateur: "إضافة متعهد جديد",
    nomComplet: "الاسم الكامل",
    matriculeFiscal: "المعرف الجبائي (MF)",
    adresse: "العنوان",
    telephone: "رقم الهاتف",
    ajouter: "إضافة",
    artistesEtrangers: "عرض يشارك فيه فنانون أجانب",
    dateCommission: "تاريخ العرض على اللجنة",
    pvLabel: "تحميل محضر الجلسة (PV)",
    nombreSpectacles: "عدد العروض",
    spectacleN: (n: number) => `العرض ${n}`,
    categorieSpectacle: "عنوان العرض",
    categoriePlaceholder: "-- اختر الصنف --",
    categories: [
      { value: "cirque",            label: "عروض الفرجة: السرك،..." },
      { value: "theatre",           label: "المسرحيات" },
      { value: "lyrique",           label: "المسرح الغنائي" },
      { value: "Concerts",          label: "الحفلات الموسيقية" },
      { value: "enregistrements",   label: "بواسطة المسجلات" },
      { value: "orchestres",        label: "بواسطة الفرق" },
      { value: "piece_mus__films_", label: "القطع الموسيقية المصاحبة للأشرطة" },
      { value: "piece_mus_diff",    label: "القطع الموسيقية المذاعة في الفواصل" },
    ],
    titreSpectacle: "إسم العرض",
    espaceSpectacle: "فضاء العرض",
    nombreArtistes: "عدد الفنانين",
    dateSpectacle: "تاريخ العرض",
    lieuSpectacle: "مكان العرض",
    typeSpectacle: "نوع العرض",
    individuel: "عرض وحيد",
    manifestation: "تظاهرة",
    submit: "إرسال",
    steps: ["طالب الترخيص", "تفاصيل العروض", "الملخص"],
    next: "التالي ←",
    prev: "→ السابق",
    summaryTitle: "ملخص الطلب",
    summaryNumero: "رقم المطلب",
    summaryDate: "تاريخ الطلب",
    summaryOrganisateur: "المتعهد",
    summaryQualite: "الصفة",
    summaryArtistesEtrangers: "فنانون أجانب",
    summaryOui: "نعم",
    summaryNon: "لا",
    summaryDateCommission: "تاريخ اللجنة",
    summarySpectacleN: (n: number) => `العرض ${n}`,
    summaryDate2: "التاريخ",
    summaryHeure: "التوقيت",
    summaryLieu: "المكان",
    summaryType: "النوع",
    summaryArtistes: "الفنانون",
    summaryNationalite: "الجنسية",
    errNumero: "رقم الترخيص مطلوب",
    errDate: "تاريخ الطلب مطلوب",
    errCommission: "تاريخ اللجنة ومحضر الجلسة مطلوبان",
    nomArtiste: (n: number) => `اسم الفنان ${n}`,
    nationalite: "الجنسية",
    tunisienne: "تونسية",
    autre: "غيرها",
    selectCountry: "-- اختر الدولة --",
    identite: "الهوية",
    chooseFile: "تحميل الوثيقة",
    noFile: "لم يتم اختيار ملف",
    fileTooLarge: "الملف أكبر من 5 ميغابايت",
    nomManifestation: "إسم التظاهرة",
    manifestationInfoTitle: "معلومات التظاهرة",
    budget: "الميزانية التقديرية",
    natureTazahora: "طبيعة التظاهرة",
    internationale: "دولية",
    locale: "محلية",
    nationale: "وطنية",
    regional: "جهوية",
    hasForeignShows: "هل هنالك عروض ينشطها أجانب؟",
    oui: "نعم",
    non: "لا",
    depensesTitle: "تفاصيل المصاريف / تكاليف الأجانب",
    montant: "المبلغ بالدينار",
  },
  fr: {
    topBarTitle: "Autorisations",
    back: "Retour",
    formTitle: "Demande d'autorisation de spectacle",
    formSubtitle: "OTDAV — Organisme Tunisien des Droits d'Auteur et des Droits Voisins",
    sectionTitle: "Déposant: Demandeur de licence",
    numeroAutorisation: "Numéro de l'autorisation",
    dateDemande: "Date de la demande",
    heureSpectacle: "Horaire du spectacle",
    organisateur: "Organisateur de spectacles",
    qualite: "Qualité",
    qualites: [
  { value: "traiteur_evenementiel", label: "Traiteur événementiel" },
  { value: "espace_touristique", label: "Espace touristique" },
  { value: "salle_fetes", label: "Salle des fêtes" },
  { value: "salle_sport", label: "Salle de sport" },
  { value: "cafes_restaurants", label: "Cafés & Restaurants" },
  { value: "transport", label: "Moyens de transport" },
  { value: "structure_publique", label: "Structure publique" },
],
    qualitePlaceholder: "-- Sélectionner --",
    choisirOrganisateur: "Choisir l'organisateur",
    ajouterOrganisateur: "Ajouter un organisateur",
    nomComplet: "Nom complet",
    matriculeFiscal: "Matricule fiscal (MF)",
    adresse: "Adresse",
    telephone: "Numéro de téléphone",
    ajouter: "Ajouter",
    artistesEtrangers: "Spectacle avec artistes étrangers",
    dateCommission: "Date de passage devant la commission",
    pvLabel: "Télécharger le PV",
    nombreSpectacles: "Nombre de spectacles",
    spectacleN: (n: number) => `Spectacle ${n}`,
    categorieSpectacle: "Catégorie du spectacle",
    categoriePlaceholder: "-- Sélectionner --",
    categories: [
      { value: "cirque",            label: "cirque: cirque..." },
      { value: "theatre",           label: "Pièces de théâtre" },
      { value: "lyrique",           label: "Théâtre lyrique" },
      { value: "Concerts",          label: "Concerts musicaux" },
      { value: "enregistrements",   label: "Par enregistrements" },
      { value: "orchestres",        label: "Par orchestres" },
      { value: "piece_mus__films_", label: "Pièces musicales accompagnant les films" },
      { value: "piece_mus_diff",    label: "Pièces musicales diffusées dans les intervalles" },
    ],
    titreSpectacle: "Titre du spectacle",
    espaceSpectacle: "Espace du spectacle",
    nombreArtistes: "Nombre d'artistes",
    dateSpectacle: "Date du spectacle",
    lieuSpectacle: "Lieu du spectacle",
    typeSpectacle: "Type de spectacle",
    individuel: "Spectacle unique",
    manifestation: "Manifestation",
    submit: "Soumettre",
    steps: ["Demandeur", "Spectacles", "Résumé"],
    next: "Suivant →",
    prev: "← Précédent",
    summaryTitle: "Résumé de la demande",
    summaryNumero: "Numéro d'autorisation",
    summaryDate: "Date de la demande",
    summaryOrganisateur: "Organisateur",
    summaryQualite: "Qualité",
    summaryArtistesEtrangers: "Artistes étrangers",
    summaryOui: "Oui",
    summaryNon: "Non",
    summaryDateCommission: "Date commission",
    summarySpectacleN: (n: number) => `Spectacle ${n}`,
    summaryDate2: "Date",
    summaryHeure: "Horaire",
    summaryLieu: "Lieu",
    summaryType: "Type",
    summaryArtistes: "Artistes",
    summaryNationalite: "Nationalité",
    errNumero: "Numéro d'autorisation requis",
    errDate: "Date de la demande requise",
    errCommission: "Date commission et PV requis",
    nomArtiste: (n: number) => `Nom de l'artiste ${n}`,
    nationalite: "Nationalité",
    tunisienne: "Tunisienne",
    autre: "Autre",
    selectCountry: "-- Sélectionner un pays --",
    identite: "Pièce d'identité",
    chooseFile: "Choisir un fichier",
    noFile: "Aucun fichier sélectionné",
    fileTooLarge: "Fichier supérieur à 5 Mo",
    nomManifestation: "Nom de la manifestation",
    manifestationInfoTitle: "Informations sur la manifestation",
    budget: "Budget prévisionnel",
    natureTazahora: "Nature de la manifestation",
    internationale: "Internationale",
    locale: "Locale",
    nationale: "Nationale",
    regional: "Régionale",
    oui: "Oui",
    non: "Non",
    depensesTitle: "Détails des dépenses / Coûts étrangers",
    montant: "Montant en DT",
  },
};

// ── Sub-components ─────────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
  <div
    className="px-6 md:px-8 py-4 border-b border-border flex items-center gap-3"
    style={{
      background: "linear-gradient(90deg, hsl(215 45% 94%) 0%, hsl(215 45% 96%) 100%)",
    }}
  >
    <span
      className="inline-block rounded-full"
      style={{
        width: "4px",
        height: "20px",
        background: "hsl(215 60% 22%)",
      }}
    />
    <h2 className="font-bold text-foreground tracking-tight" style={{ fontSize: "18px" }}>
      {title}
    </h2>
  </div>
);

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <div className="flex-shrink-0 w-full sm:w-[200px] sm:pt-2">
    <p className="font-medium text-foreground" style={{ fontSize: "14.5px" }}>
      {label} {required && <span className="text-destructive">*</span>}
    </p>
  </div>
);

const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-2.5">
    {children}
  </div>
);

const ArtistFileUpload = ({
  file,
  onChange,
  btnText,
  noFileText,
  tooLargeText,
  label,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  btnText: string;
  noFileText: string;
  tooLargeText: string;
  label: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 5 * 1024 * 1024) {
      setError(tooLargeText);
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
    } else {
      setError("");
      onChange(f);
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0">
      <span className="font-medium text-foreground mb-1" style={{ fontSize: "13px" }}>
        {label} <span className="text-destructive">*</span>
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative inline-block">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              background: "hsl(var(--primary))",
              color: "white",
              borderRadius: "6px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {btnText}
          </button>
        </div>
        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
          {file ? `${file.name} (${(file.size / 1024).toFixed(0)} Ko)` : noFileText}
        </span>
      </div>
      {error && <p className="text-destructive mt-1" style={{ fontSize: "12px" }}>{error}</p>}
    </div>
  );
};

const InlineFileUpload = ({
  file,
  onChange,
  btnText,
  tooLargeText,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  btnText: string;
  tooLargeText: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 5 * 1024 * 1024) {
      setError(tooLargeText);
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
    } else {
      setError("");
      onChange(f);
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="relative inline-block">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              background: "hsl(var(--primary))",
              color: "white",
              borderRadius: "6px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {btnText}
          </button>
        </div>
        {file && (
          <span
            className="text-muted-foreground"
            style={{ fontSize: "11px", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={file.name}
          >
            {file.name}
          </span>
        )}
      </div>
      {error && <p className="text-destructive mt-1" style={{ fontSize: "11px" }}>{error}</p>}
    </div>
  );
};

const ArtistExpensesTable = ({
  nationality,
  expenses,
  lang,
  montantPlaceholder,
  chooseFile,
  fileTooLarge,
  depensesTitle,
  onUpdate,
}: {
  nationality: "tunisienne" | "autre";
  expenses: ArtistExpensesState;
  lang: Lang;
  montantPlaceholder: string;
  chooseFile: string;
  fileTooLarge: string;
  depensesTitle: string;
  onUpdate: (key: ArtistExpenseKey, field: keyof ExpenseRow, value: string | File | null) => void;
}) => {
  const keys: ArtistExpenseKey[] =
    nationality === "tunisienne" ? ARTIST_TUNISIAN_KEYS : [...ARTIST_EXPENSE_KEYS];
  if (keys.length === 0) return null;
  return (
    <div className="mt-2 rounded-lg border border-border overflow-hidden">
      <div
        className="px-4 py-2.5 border-b border-border flex items-center gap-2"
        style={{
          background: "linear-gradient(90deg, hsl(215 35% 90%) 0%, hsl(215 35% 93%) 100%)",
        }}
      >
        <span
          className="inline-block rounded-full"
          style={{ width: "3px", height: "14px", background: "hsl(215 60% 22%)" }}
        />
        <h3 className="font-bold text-foreground tracking-tight" style={{ fontSize: "14px" }}>
          {depensesTitle}
        </h3>
      </div>
      {keys.map((key, idx) => (
        <div
          key={key}
          className="flex items-center gap-3 px-4 py-2.5"
          style={{
            borderTop: idx > 0 ? "1px solid hsl(var(--border) / 0.4)" : undefined,
            background: idx % 2 === 0 ? "transparent" : "hsl(215 30% 97%)",
          }}
        >
          <span
            className="font-semibold text-foreground flex-shrink-0"
            style={{ fontSize: "13px", width: "170px" }}
          >
            {ARTIST_EXPENSE_LABELS[key][lang]} <span className="text-destructive">*</span>
          </span>
          <input
            type="number"
            min="0"
            required
            value={expenses[key].montant}
            onChange={(e) => onUpdate(key, "montant", e.target.value)}
            placeholder={montantPlaceholder}
            className="input-field flex-shrink-0"
            dir="ltr"
            style={{ fontSize: "13px", width: "140px" }}
          />
          <InlineFileUpload
            file={expenses[key].fichier}
            onChange={(f) => onUpdate(key, "fichier", f)}
            btnText={chooseFile}
            tooLargeText={fileTooLarge}
          />
        </div>
      ))}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────

const API = import.meta.env.VITE_API_URL;

const SpectaclesPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("ar");
  const [form, setForm] = useState<FormState>(initial);
  const [nombreSpectacles, setNombreSpectacles] = useState("1");
  const [spectacles, setSpectacles] = useState<SpectacleState[]>(makeSpectacles(1));
  const [organisateurs, setOrganisateurs] = useState<{ id: number; nom: string }[]>([]);
  const [selectedOrganisateur, setSelectedOrganisateur] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrganisateur, setNewOrganisateur] = useState({ nom: "", mf: "", rne: "", adresse: "", telephone: "", fax: "", email: "", nomResponsable: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    fetch(`${API}/autorisations/organisateurs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrganisateurs(data); })
      .catch(() => {});
  }, [navigate]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleNombreSpectacles = (val: string) => {
    setNombreSpectacles(val);
    const n = parseInt(val, 10);
    setSpectacles((prev) =>
      n > prev.length ? [...prev, ...makeSpectacles(n - prev.length)] : prev.slice(0, n)
    );
  };

  const updateSpectacle = <K extends keyof SpectacleState>(
    sIdx: number,
    field: K,
    value: SpectacleState[K]
  ) => {
    setSpectacles((prev) =>
      prev.map((s, i) => (i === sIdx ? { ...s, [field]: value } : s))
    );
  };

  const setSpectacleNombreArtistes = (sIdx: number, val: string) => {
    setSpectacles((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, nombreArtistes: val, artists: makeArtists(parseInt(val, 10)) } : s
      )
    );
  };

  const updateSpectacleArtist = (
    sIdx: number,
    aIdx: number,
    field: keyof ArtistRow,
    value: string | File | null
  ) => {
    setSpectacles((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? { ...s, artists: s.artists.map((a, j) => (j === aIdx ? { ...a, [field]: value } : a)) }
          : s
      )
    );
  };

  const updateSpectacleArtistExpense = (
    sIdx: number,
    aIdx: number,
    expKey: ArtistExpenseKey,
    field: keyof ExpenseRow,
    value: string | File | null
  ) => {
    setSpectacles((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              artists: s.artists.map((a, j) =>
                j === aIdx
                  ? { ...a, expenses: { ...a.expenses, [expKey]: { ...a.expenses[expKey], [field]: value } } }
                  : a
              ),
            }
          : s
      )
    );
  };

  const isRtl = lang === "ar";
  const t = T[lang];

  const validateStep1 = (): boolean => {
    if (!form.numeroAutorisation.trim()) { setStepError(t.errNumero); return false; }
    if (!form.dateDemandeAutorisation) { setStepError(t.errDate); return false; }
    if (form.hasArtistesEtrangers && (!form.dateCommission || !form.pvFile)) {
      setStepError(t.errCommission); return false;
    }
    return true;
  };

  const handleNext = () => {
    setStepError("");
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setStepError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  // Helper to find organisateur name by id
  const selectedOrgName = organisateurs.find((o) => String(o.id) === selectedOrganisateur)?.nom || "";

  // Helper: qualité label from value
  const qualiteLabel = t.qualites.find((q: QualiteOption) => q.value === form.qualite)?.label || form.qualite;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div
        className="flex-shrink-0 border-b border-border/60 sticky top-0 z-30"
        style={{
          background: "linear-gradient(180deg, hsl(215 60% 22%) 0%, hsl(215 60% 18%) 100%)",
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.18)",
        }}
      >
        <div className="max-w-[85%] mx-auto px-4 sm:px-6 flex items-center justify-between h-16" dir="ltr">
          <button
            onClick={() => navigate("/dashboard/autorisation")}
            className="flex items-center gap-2 text-white/75 font-semibold hover:text-white transition-colors group"
            style={{ fontSize: "14px" }}
          >
            <span
              className="flex items-center justify-center w-7 h-7 rounded-full transition-colors group-hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            <span className="hidden sm:inline">{lang === "ar" ? "Retour" : t.back}</span>
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/otdav-logo.png"
              alt="OTDAV"
              className="h-9 w-9 object-contain rounded bg-white/95 p-1"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
            />
            <div className="flex flex-col leading-tight">
              <h1 className="text-white font-semibold tracking-tight" style={{ fontSize: "15px" }}>
                {t.topBarTitle}
              </h1>
              <span className="text-white/55" style={{ fontSize: "11px" }}>
                OTDAV
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Form body */}
      <div
        className="flex-1 max-w-[85%] mx-auto w-full px-4 sm:px-6 py-6"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Page title card + language toggle */}
        <div className="paper-form mb-4 overflow-hidden">
          <div
            className="flex items-center justify-between gap-4 px-6 md:px-8 py-4 border-b border-border"
            dir="ltr"
            style={{
              background: "linear-gradient(135deg, hsl(215 45% 94%) 0%, hsl(215 45% 97%) 100%)",
            }}
          >
            <div className={`flex items-center gap-3 ${isRtl ? "order-2 flex-row-reverse text-right" : "order-1 text-left"}`}>
              <span
                className="hidden sm:flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  width: "44px",
                  height: "44px",
                  background: "hsl(215 60% 22%)",
                  boxShadow: "0 2px 6px hsl(215 60% 22% / 0.2)",
                }}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
              </span>
              <div>
                <h2 className="font-bold text-foreground tracking-tight" style={{ fontSize: "18px" }}>
                  {t.formTitle}
                </h2>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
                  {t.formSubtitle}
                </p>
              </div>
            </div>

            {/* Language toggle — always LTR so it never flips */}
            <div
              className={`flex items-center rounded-full p-0.5 flex-shrink-0 ${isRtl ? "order-1" : "order-2"}`}
              style={{ background: "hsl(215 25% 90%)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)" }}
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
                Français
              </button>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="paper-form mb-4 px-6 md:px-12 py-6">
          <div className="flex items-start w-full">
            {t.steps.map((label: string, i: number) => {
              const isDone = step > i + 1;
              const isActive = step === i + 1;
              const isLast = i === t.steps.length - 1;
              return (
                <div
                  key={i}
                  className={`flex items-start ${isLast ? "" : "flex-1"} min-w-0`}
                >
                  <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: "70px" }}>
                    <div
                      className="rounded-full flex items-center justify-center font-bold transition-all duration-300"
                      style={{
                        width: isActive ? "40px" : "34px",
                        height: isActive ? "40px" : "34px",
                        fontSize: "14px",
                        background: isDone
                          ? "hsl(215 60% 22%)"
                          : isActive
                          ? "hsl(215 60% 22%)"
                          : "hsl(215 25% 90%)",
                        color: isDone || isActive ? "white" : "hsl(215 15% 50%)",
                        boxShadow: isActive
                          ? "0 0 0 4px hsl(215 60% 22% / 0.12), 0 2px 6px hsl(215 60% 22% / 0.25)"
                          : "none",
                      }}
                    >
                      {isDone ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-center transition-colors ${isActive ? "font-bold" : "font-medium"}`}
                      style={{
                        fontSize: "12px",
                        color: isActive
                          ? "hsl(215 60% 22%)"
                          : isDone
                          ? "hsl(215 25% 25%)"
                          : "hsl(215 10% 55%)",
                        maxWidth: "100px",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < t.steps.length - 1 && (
                    <div className="flex-1 mx-1 sm:mx-2" style={{ marginTop: isActive ? "20px" : "17px" }}>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(215 25% 90%)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: isDone ? "100%" : "0%",
                            background: "hsl(215 60% 22%)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step error */}
        {stepError && (
          <div
            className="mb-4 px-4 py-3 rounded-lg flex items-center gap-3 border"
            style={{
              background: "hsl(0 65% 97%)",
              color: "hsl(0 65% 35%)",
              borderColor: "hsl(0 65% 88%)",
              fontSize: "14px",
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="font-medium">{stepError}</span>
          </div>
        )}

        {/* Step 1 — Demandeur */}
        {step === 1 && (<>

        {/* Section: Déposant */}
        <div className="paper-form mb-4">
          <SectionHeader title={t.sectionTitle} />

          <div className="px-6 md:px-8 py-4 space-y-1">

            {/* رقم الترخيص + تاريخ الطلب — side by side */}
            <FieldRow>
              <FieldLabel label={t.numeroAutorisation} required />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={form.numeroAutorisation}
                  onChange={(e) => set("numeroAutorisation", e.target.value)}
                  className="input-field w-full"
                  style={{ fontSize: "14px" }}
                />
              </div>
              <FieldLabel label={t.dateDemande} required />
              <div className="flex-1 min-w-0">
                <input
                  type="date"
                  value={form.dateDemandeAutorisation}
                  onChange={(e) => set("dateDemandeAutorisation", e.target.value)}
                  className="input-field w-full"
                  style={{ fontSize: "14px" }}
                />
              </div>
            </FieldRow>

            <div className="border-t border-border/40 my-2" />

            {/* متعهد حفلات checkbox */}
            <FieldRow>
              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={form.isOrganisateur}
                  onChange={(e) => set("isOrganisateur", e.target.checked)}
                  className="accent-primary flex-shrink-0"
                  style={{ width: "18px", height: "18px" }}
                />
                <span className="font-medium text-foreground" style={{ fontSize: "15px" }}>
                  {t.organisateur}
                </span>
              </label>
            </FieldRow>

            {/* Conditional: when checked → organizer dropdown; when not → qualité dropdown */}
            {form.isOrganisateur ? (
              <div className="space-y-2">
                <FieldRow>
                  <FieldLabel label={t.choisirOrganisateur} required />
                  <div className="flex-1 min-w-0">
                    <select
                      value={selectedOrganisateur}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__add__") {
                          setShowAddForm(true);
                          setSelectedOrganisateur("");
                        } else {
                          setSelectedOrganisateur(val);
                          setShowAddForm(false);
                        }
                      }}
                      className="input-field w-full"
                      style={{ fontSize: "14px" }}
                    >
                      <option value="">— {t.choisirOrganisateur} —</option>
                      {organisateurs.map((o) => (
                        <option key={o.id} value={String(o.id)}>
                          {o.nom}
                        </option>
                      ))}
                      <option value="__add__" style={{ color: "#1d6fcf", fontWeight: 600 }}>
                        + {t.ajouterOrganisateur}
                      </option>
                    </select>
                  </div>
                </FieldRow>

                {/* Mini form for adding a new organizer */}
                {showAddForm && (
                  <div
                    className="mx-0 p-4 rounded-lg border border-border space-y-3"
                    style={{ background: "hsl(215 45% 97%)" }}
                  >
                    {[
                      { key: "nom" as const, label: t.nomComplet, required: true },
                      { key: "nomResponsable" as const, label: lang === "ar" ? "إسم ولقب المسؤول" : "Nom et prénom du responsable", required: false },
                      { key: "mf" as const, label: t.matriculeFiscal, required: true },
                      { key: "rne" as const, label: lang === "ar" ? "السجل الوطني للمؤسسات" : "Registre National des Entreprises", required: false },
                      { key: "adresse" as const, label: t.adresse, required: true },
                      { key: "telephone" as const, label: t.telephone, required: true },
                      { key: "fax" as const, label: lang === "ar" ? "الفاكس" : "Fax", required: false },
                      { key: "email" as const, label: lang === "ar" ? "البريد الإلكتروني" : "Email", required: false },
                    ].map(({ key, label, required }) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="flex-shrink-0 font-medium text-foreground" style={{ fontSize: "13px", width: "180px" }}>
                          {label} {required && <span className="text-destructive">*</span>}
                        </span>
                        <input
                          type="text"
                          value={newOrganisateur[key]}
                          onChange={(e) => setNewOrganisateur((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="input-field flex-1 min-w-0"
                          style={{ fontSize: "13px" }}
                        />
                      </div>
                    ))}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        disabled={!newOrganisateur.nom.trim()}
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          try {
                            const res = await fetch(`${API}/autorisations/organisateurs`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              body: JSON.stringify(newOrganisateur),
                            });
                            const data = await res.json();
                            if (!res.ok) { setErrorMsg(data.error || "Erreur"); return; }
                            setOrganisateurs((prev) => [...prev, data]);
                            setSelectedOrganisateur(String(data.id));
                            setShowAddForm(false);
                            setNewOrganisateur({ nom: "", mf: "", rne: "", adresse: "", telephone: "", fax: "", email: "", nomResponsable: "" });
                          } catch { setErrorMsg("Erreur réseau"); }
                        }}
                        className="btn-primary"
                        style={{
                          padding: "6px 20px",
                          fontSize: "13px",
                          opacity: newOrganisateur.nom.trim() ? 1 : 0.5,
                        }}
                      >
                        {t.ajouter}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <FieldRow>
                <FieldLabel label={t.qualite} required />
                <div className="flex-1 min-w-0">
                  <select
                    value={form.qualite}
                    onChange={(e) => set("qualite", e.target.value)}
                    className="input-field w-full"
                    style={{ fontSize: "14px" }}
                  >
                    <option value="">{t.qualitePlaceholder}</option>
                    {t.qualites.map((q) => (
  <option key={q.value} value={q.value}>
    {q.label}
  </option>
))}
                  </select>
                </div>
              </FieldRow>
            )}

            <div className="border-t border-border/40 my-2" />

            {/* عرض يشارك فيه فنانون أجانب — standalone checkbox, no dependent fields */}
            <FieldRow>
              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={form.hasArtistesEtrangers}
                  onChange={(e) => set("hasArtistesEtrangers", e.target.checked)}
                  className="accent-primary flex-shrink-0"
                  style={{ width: "18px", height: "18px" }}
                />
                <span className="font-medium text-foreground" style={{ fontSize: "15px" }}>
                  {t.artistesEtrangers}
                </span>
              </label>
            </FieldRow>

            {/* Conditional fields when artistes étrangers is checked */}
            {form.hasArtistesEtrangers && (
              <FieldRow>
                {/* Date de passage devant la commission */}
                <FieldLabel label={t.dateCommission} required />
                <div className="flex-shrink-0">
                  <input
                    type="date"
                    value={form.dateCommission}
                    onChange={(e) => set("dateCommission", e.target.value)}
                    className="input-field"
                    dir="ltr"
                    style={{ fontSize: "14px" }}
                  />
                </div>

                {/* PV file upload */}
                <div className="flex flex-col flex-shrink-0 gap-1">
                  <span className="font-medium text-foreground" style={{ fontSize: "15px" }}>
                    {t.pvLabel} <span className="text-destructive">*</span>
                  </span>
                  <InlineFileUpload
                    file={form.pvFile}
                    onChange={(f) => set("pvFile", f)}
                    btnText={t.chooseFile}
                    tooLargeText={t.fileTooLarge}
                  />
                </div>
              </FieldRow>
            )}

            <div className="border-t border-border/40 my-2" />

            {/* عدد العروض */}
            <FieldRow>
              <FieldLabel label={t.nombreSpectacles} required />
              <div className="flex-1 min-w-0">
                <select
                  value={nombreSpectacles}
                  onChange={(e) => handleNombreSpectacles(e.target.value)}
                  className="input-field w-full"
                  dir="ltr"
                  style={{ fontSize: "14px" }}
                >
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </FieldRow>

          </div>
        </div>

        </>)}

        {/* Step 2 — Spectacles */}
        {step === 2 && (<>

        {/* Spectacle cards */}
        {spectacles.map((spectacle, sIdx) => {
          const color = SPECTACLE_COLORS[sIdx % SPECTACLE_COLORS.length];
          return (
          <div
            key={sIdx}
            className="paper-form mb-5 overflow-hidden"
            style={{
              border: `2px solid ${color.border}`,
              boxShadow: `0 1px 3px 0 rgb(0 0 0 / 0.06), 0 4px 12px -2px ${color.border}33`,
            }}
          >
            {/* Card header */}
            <div
              className="px-6 md:px-8 py-3.5 border-b flex items-center gap-3"
              style={{
                background: `linear-gradient(90deg, ${color.header} 0%, ${color.header}cc 100%)`,
                borderColor: color.border,
              }}
            >
              <span
                className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                style={{
                  width: "30px",
                  height: "30px",
                  fontSize: "14px",
                  background: color.border,
                }}
              >
                {sIdx + 1}
              </span>
              <h2 className="font-bold text-foreground tracking-tight" style={{ fontSize: "17px" }}>
                {t.spectacleN(sIdx + 1)}
              </h2>
            </div>

            <div className="px-6 md:px-8 py-4 space-y-1">

              {/* Catégorie du spectacle */}
              <FieldRow>
                <FieldLabel label={t.categorieSpectacle} required />
                <div className="flex-1 min-w-0">
                  <select
                    value={spectacle.categorieSpectacle}
                    onChange={(e) => updateSpectacle(sIdx, "categorieSpectacle", e.target.value)}
                    className="input-field w-full"
                    style={{ fontSize: "14px" }}
                  >
                    <option value="">{t.categoriePlaceholder}</option>
                    {t.categories.map((c: { value: string; label: string }) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </FieldRow>
              <div className="border-t border-border/40 my-2" />

              {/* Titre du spectacle */}
              <FieldRow>
                <FieldLabel label={t.titreSpectacle} required />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={spectacle.titreSpectacle}
                    onChange={(e) => updateSpectacle(sIdx, "titreSpectacle", e.target.value)}
                    className="input-field w-full"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </FieldRow>

              <div className="border-t border-border/40 my-2" />

              {/* Espace du spectacle */}
              <FieldRow>
                <FieldLabel label={t.espaceSpectacle} required />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={spectacle.espaceSpectacle}
                    onChange={(e) => updateSpectacle(sIdx, "espaceSpectacle", e.target.value)}
                    className="input-field w-full"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </FieldRow>

              <div className="border-t border-border/40 my-2" />

              {/* A. Nombre d'artistes */}
              <FieldRow>
                <FieldLabel label={t.nombreArtistes} required />
                <div className="flex-1 min-w-0">
                  <select
                    value={spectacle.nombreArtistes}
                    onChange={(e) => setSpectacleNombreArtistes(sIdx, e.target.value)}
                    className="input-field w-full"
                    dir="ltr"
                    style={{ fontSize: "14px" }}
                  >
                    {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </FieldRow>

              {/* Artist rows */}
              {spectacle.artists.map((artist, aIdx) => (
                <div key={aIdx} className="border-t border-border/30 pt-2 mt-1">
                  <div className="flex flex-wrap items-center gap-3 py-1">
                    {/* Name */}
                    <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                      <label
                        className="font-medium text-foreground whitespace-nowrap flex-shrink-0"
                        style={{ fontSize: "13px" }}
                      >
                        {t.nomArtiste(aIdx + 1)} <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={artist.name}
                        onChange={(e) => updateSpectacleArtist(sIdx, aIdx, "name", e.target.value)}
                        className="input-field flex-1 min-w-0"
                        style={{ fontSize: "13px" }}
                      />
                    </div>

                    {/* Nationality checkboxes */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={artist.nationality === "tunisienne"}
                          onChange={() => updateSpectacleArtist(sIdx, aIdx, "nationality", "tunisienne")}
                          className="accent-primary"
                          style={{ width: "15px", height: "15px" }}
                        />
                        <span className="text-foreground" style={{ fontSize: "13px" }}>
                          {t.tunisienne}
                        </span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={artist.nationality === "autre"}
                          onChange={() => updateSpectacleArtist(sIdx, aIdx, "nationality", "autre")}
                          className="accent-primary"
                          style={{ width: "15px", height: "15px" }}
                        />
                        <span className="text-foreground" style={{ fontSize: "13px" }}>
                          {t.autre}
                        </span>
                      </label>
                    </div>

                    {/* Country dropdown + identity upload (only when "autre") */}
                    {artist.nationality === "autre" && (
                      <>
                        <div className="flex-shrink-0 min-w-[160px]">
                          <select
                            value={artist.country}
                            onChange={(e) => updateSpectacleArtist(sIdx, aIdx, "country", e.target.value)}
                            className="input-field w-full"
                            dir="ltr"
                            style={{ fontSize: "13px" }}
                          >
                            <option value="">{t.selectCountry}</option>
                            {COUNTRIES.map((c) => (
                              <option key={c.fr} value={c.fr}>
                                {lang === "ar" ? c.ar : c.fr}
                              </option>
                            ))}
                          </select>
                        </div>
                        <ArtistFileUpload
                          file={artist.identityFile}
                          onChange={(f) => updateSpectacleArtist(sIdx, aIdx, "identityFile", f)}
                          btnText={t.chooseFile}
                          noFileText={t.noFile}
                          tooLargeText={t.fileTooLarge}
                          label={t.identite}
                        />
                      </>
                    )}
                  </div>

                  {/* Expense table — 2 rows for tunisienne, 10 rows for autre */}
                  <ArtistExpensesTable
                    nationality={artist.nationality}
                    expenses={artist.expenses}
                    lang={lang}
                    montantPlaceholder={t.montant}
                    chooseFile={t.chooseFile}
                    fileTooLarge={t.fileTooLarge}
                    depensesTitle={t.depensesTitle}
                    onUpdate={(key, field, value) =>
                      updateSpectacleArtistExpense(sIdx, aIdx, key, field, value)
                    }
                  />
                </div>
              ))}

              <div className="border-t border-border/40 my-2" />

              {/* B. Date + Heure du spectacle */}
              <FieldRow>
                <FieldLabel label={t.dateSpectacle} required />
                <div className="flex-shrink-0">
                  <input
                    type="date"
                    value={spectacle.dateSpectacle}
                    onChange={(e) => updateSpectacle(sIdx, "dateSpectacle", e.target.value)}
                    className="input-field"
                    dir="ltr"
                    style={{ fontSize: "14px" }}
                  />
                </div>
                <FieldLabel label={t.heureSpectacle} required />
                <div className="flex-shrink-0">
  <input
    type="time"
    value={spectacle.heureSpectacle}
    onChange={(e) => updateSpectacle(sIdx, "heureSpectacle", e.target.value)}
    className="input-field"
    dir="ltr"
    lang="fr-FR"
    style={{ fontSize: "14px" }}
  />
                </div>
              </FieldRow>

              <div className="border-t border-border/40 my-2" />

              {/* C. Lieu du spectacle */}
              <FieldRow>
                <FieldLabel label={t.lieuSpectacle} required />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={spectacle.lieuSpectacle}
                    onChange={(e) => updateSpectacle(sIdx, "lieuSpectacle", e.target.value)}
                    className="input-field w-full"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </FieldRow>

              <div className="border-t border-border/40 my-2" />

              {/* D. Type de spectacle */}
              <FieldRow>
                <FieldLabel label={t.typeSpectacle} required />
                <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
                  {(["individuel", "manifestation"] as const).map((val) => (
                    <label
                      key={val}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                        spectacle.typeSpectacle === val
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`typeSpectacle-${sIdx}`}
                        value={val}
                        checked={spectacle.typeSpectacle === val}
                        onChange={() => updateSpectacle(sIdx, "typeSpectacle", val)}
                        className="accent-primary flex-shrink-0"
                        style={{ width: "16px", height: "16px" }}
                      />
                      <span className="font-medium text-foreground" style={{ fontSize: "14px" }}>
                        {t[val]}
                      </span>
                    </label>
                  ))}
                </div>
              </FieldRow>

              {/* تظاهرة sub-section */}
              {spectacle.typeSpectacle === "manifestation" && (
                <div
                  className="mt-3 rounded-lg border-2 overflow-hidden"
                  style={{ borderColor: "hsl(215 45% 80%)" }}
                >
                  <div
                    className="px-4 py-2.5 border-b border-border flex items-center gap-2"
                    style={{
                      background: "linear-gradient(90deg, hsl(215 35% 90%) 0%, hsl(215 35% 93%) 100%)",
                    }}
                  >
                    <span
                      className="inline-block rounded-full"
                      style={{ width: "3px", height: "16px", background: "hsl(215 60% 22%)" }}
                    />
                    <h3 className="font-bold text-foreground tracking-tight" style={{ fontSize: "15px" }}>
                      {t.manifestationInfoTitle}
                    </h3>
                  </div>

                  <div className="px-4 py-3 space-y-1">

                    {/* Nom de la manifestation */}
                    <FieldRow>
                      <FieldLabel label={t.nomManifestation} required />
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={spectacle.nomManifestation}
                          onChange={(e) => updateSpectacle(sIdx, "nomManifestation", e.target.value)}
                          className="input-field w-full"
                          style={{ fontSize: "14px" }}
                        />
                      </div>
                    </FieldRow>

                    <div className="border-t border-border/40 my-2" />

                    {/* Budget */}
                    <FieldRow>
                      <FieldLabel label={t.budget} required />
                      <div className="flex-1 min-w-0">
                        <input
                          type="number"
                          min="0"
                          value={spectacle.budget}
                          onChange={(e) => updateSpectacle(sIdx, "budget", e.target.value)}
                          className="input-field w-full"
                          dir="ltr"
                          style={{ fontSize: "14px" }}
                        />
                      </div>
                    </FieldRow>

                    <div className="border-t border-border/40 my-2" />

                    {/* Nature de la manifestation */}
                    <FieldRow>
                      <FieldLabel label={t.natureTazahora} required />
                      <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
                        {(["locale", "regional", "nationale", "internationale"] as const).map((val) => (
                          <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`natureTazahora-${sIdx}`}
                              value={val}
                              checked={spectacle.natureTazahora === val}
                              onChange={() => updateSpectacle(sIdx, "natureTazahora", val)}
                              className="accent-primary flex-shrink-0"
                              style={{ width: "16px", height: "16px" }}
                            />
                            <span className="font-medium text-foreground" style={{ fontSize: "14px" }}>
                              {t[val]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FieldRow>

                    <div className="border-t border-border/40 my-2" />

                  </div>
                </div>
              )}

            </div>
          </div>
          );
        })}

        </>)}

        {/* Step 3 — Résumé */}
        {step === 3 && (<>

        {/* Summary card */}
        <div className="paper-form mb-4 overflow-hidden">
          <div
            className="px-6 md:px-8 py-4 border-b border-border flex items-center gap-3"
            style={{
              background: "linear-gradient(90deg, hsl(215 45% 94%) 0%, hsl(215 45% 96%) 100%)",
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{ width: "4px", height: "20px", background: "hsl(215 60% 22%)" }}
            />
            <h3 className="font-bold text-foreground tracking-tight" style={{ fontSize: "18px" }}>
              {t.summaryTitle}
            </h3>
          </div>
          <div className="px-6 md:px-8 py-5 space-y-5 text-sm">
            {/* Demandeur info */}
            <div>
              <p
                className="uppercase tracking-wider font-semibold mb-3"
                style={{ color: "hsl(215 15% 50%)", fontSize: "11px" }}
              >
                {lang === "ar" ? "معلومات الطالب" : "Demandeur"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: t.summaryNumero, value: form.numeroAutorisation || "—" },
                  { label: t.summaryDate, value: form.dateDemandeAutorisation || "—" },
                  {
                    label: form.isOrganisateur ? t.summaryOrganisateur : t.summaryQualite,
                    value: form.isOrganisateur ? selectedOrgName || "—" : qualiteLabel,
                  },
                  {
                    label: t.summaryArtistesEtrangers,
                    value: form.hasArtistesEtrangers ? t.summaryOui : t.summaryNon,
                  },
                  ...(form.hasArtistesEtrangers && form.dateCommission
                    ? [{ label: t.summaryDateCommission, value: form.dateCommission }]
                    : []),
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 py-1.5 px-3 rounded-md"
                    style={{ background: "hsl(215 30% 97%)" }}
                  >
                    <span
                      className="font-medium"
                      style={{ color: "hsl(215 15% 50%)", fontSize: "11.5px" }}
                    >
                      {item.label}
                    </span>
                    <span className="text-foreground font-semibold" style={{ fontSize: "13.5px" }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spectacles summary */}
            <div>
              <p
                className="uppercase tracking-wider font-semibold mb-3"
                style={{ color: "hsl(215 15% 50%)", fontSize: "11px" }}
              >
                {lang === "ar" ? "العروض" : "Spectacles"} ({spectacles.length})
              </p>
              <div className="space-y-3">
                {spectacles.map((sp, sIdx) => {
                  const color = SPECTACLE_COLORS[sIdx % SPECTACLE_COLORS.length];
                  return (
                    <div
                      key={sIdx}
                      className="rounded-lg border overflow-hidden"
                      style={{ borderColor: color.border }}
                    >
                      <div
                        className="px-4 py-2 flex items-center gap-2 border-b"
                        style={{ background: color.header, borderColor: color.border }}
                      >
                        <span
                          className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                          style={{
                            width: "22px",
                            height: "22px",
                            fontSize: "11px",
                            background: color.border,
                          }}
                        >
                          {sIdx + 1}
                        </span>
                        <p className="font-semibold text-foreground" style={{ fontSize: "13.5px" }}>
                          {t.summarySpectacleN(sIdx + 1)}
                        </p>
                      </div>
                      <div className="px-4 py-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2 text-sm">
                          {[
                            {
                              label: t.categorieSpectacle,
                              value:
                                t.categories.find(
                                  (c: { value: string; label: string }) => c.value === sp.categorieSpectacle
                                )?.label || "—",
                            },
                            { label: t.titreSpectacle, value: sp.titreSpectacle || "—" },
                            { label: t.espaceSpectacle, value: sp.espaceSpectacle || "—" },
                            { label: t.summaryDate2, value: sp.dateSpectacle || "—" },
                            { label: t.summaryHeure, value: sp.heureSpectacle || "—" },
                            { label: t.summaryLieu, value: sp.lieuSpectacle || "—" },
                            { label: t.summaryType, value: sp.typeSpectacle || "—" },
                          ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-0.5">
                              <span
                                className="font-medium"
                                style={{ color: "hsl(215 15% 50%)", fontSize: "11.5px" }}
                              >
                                {item.label}
                              </span>
                              <span className="text-foreground" style={{ fontSize: "13px" }}>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        {sp.typeSpectacle === "manifestation" && sp.nomManifestation && (
                          <div
                            className="px-3 py-2 rounded-md flex items-center gap-2"
                            style={{ background: "hsl(215 30% 97%)" }}
                          >
                            <span
                              className="font-medium"
                              style={{ color: "hsl(215 15% 50%)", fontSize: "12px" }}
                            >
                              {t.nomManifestation}:
                            </span>
                            <span className="text-foreground font-medium" style={{ fontSize: "13px" }}>
                              {sp.nomManifestation}
                            </span>
                          </div>
                        )}
                        {sp.artists.length > 0 && (
                          <div>
                            <p
                              className="font-medium mb-2"
                              style={{ color: "hsl(215 15% 50%)", fontSize: "11.5px" }}
                            >
                              {t.summaryArtistes} ({sp.artists.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {sp.artists.map((art, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-border"
                                  style={{ background: "hsl(215 30% 97%)", fontSize: "12.5px" }}
                                >
                                  <span
                                    className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                                    style={{
                                      width: "18px",
                                      height: "18px",
                                      fontSize: "10px",
                                      background: "hsl(215 60% 22%)",
                                    }}
                                  >
                                    {aIdx + 1}
                                  </span>
                                  <span className="text-foreground font-medium">
                                    {art.name || "—"}
                                  </span>
                                  <span
                                    className="px-1.5 py-0.5 rounded"
                                    style={{
                                      background:
                                        art.nationality === "tunisienne"
                                          ? "hsl(215 45% 90%)"
                                          : "hsl(215 25% 88%)",
                                      color: "hsl(215 60% 22%)",
                                      fontSize: "10.5px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {art.nationality === "tunisienne" ? t.tunisienne : t.autre}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMsg && (
          <div
            className="mb-4 px-4 py-3 rounded-lg flex items-center gap-3 border"
            style={{
              background: "hsl(150 50% 96%)",
              color: "hsl(150 60% 25%)",
              borderColor: "hsl(150 50% 85%)",
              fontSize: "14px",
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div
            className="mb-4 px-4 py-3 rounded-lg flex items-center gap-3 border"
            style={{
              background: "hsl(0 65% 97%)",
              color: "hsl(0 65% 35%)",
              borderColor: "hsl(0 65% 88%)",
              fontSize: "14px",
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        </>)}

        {/* Navigation buttons — sticky footer */}
        <div
          className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mt-6 flex items-center justify-between border-t border-border"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "0 -2px 8px -4px rgba(0,0,0,0.08)",
            zIndex: 10,
          }}
        >
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="rounded-lg font-semibold border-2 transition-all duration-150 hover:bg-primary/5 active:scale-[0.98]"
              style={{
                fontSize: "14px",
                padding: "10px 22px",
                borderColor: "hsl(215 60% 22%)",
                color: "hsl(215 60% 22%)",
                background: "white",
              }}
            >
              {t.prev}
            </button>
          ) : <div />}

          <span
            className="hidden sm:flex items-center gap-1.5 font-medium"
            style={{ color: "hsl(215 15% 50%)", fontSize: "12px" }}
          >
            <span
              className="rounded-full"
              style={{ width: "6px", height: "6px", background: "hsl(215 60% 22%)" }}
            />
            {lang === "ar"
              ? `الخطوة ${step} من ${t.steps.length}`
              : `Étape ${step} / ${t.steps.length}`}
          </span>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="btn-primary"
              style={{ fontSize: "15px", padding: "10px 32px" }}
            >
              {t.next}
            </button>
          ) : (
            <button
              disabled={submitting}
              onClick={async () => {
                setSuccessMsg("");
                setErrorMsg("");

                // Validation
                if (!form.numeroAutorisation.trim()) {
                  setErrorMsg(lang === "ar" ? "رقم الترخيص مطلوب" : "Numéro d'autorisation requis");
                  return;
                }
                if (!form.dateDemandeAutorisation) {
                  setErrorMsg(lang === "ar" ? "تاريخ الطلب مطلوب" : "Date de la demande requise");
                  return;
                }
                const hasValidSpectacle = spectacles.some(
                  (sp) => sp.dateSpectacle && sp.heureSpectacle && sp.lieuSpectacle.trim() && sp.typeSpectacle
                );
                if (!hasValidSpectacle) {
                  setErrorMsg(lang === "ar" ? "يجب ملء عرض واحد على الأقل (تاريخ، توقيت، مكان، نوع)" : "Au moins un spectacle avec date, horaire, lieu et type requis");
                  return;
                }
                if (form.hasArtistesEtrangers && (!form.dateCommission || !form.pvFile)) {
                  setErrorMsg(lang === "ar" ? "تاريخ اللجنة ومحضر الجلسة مطلوبان" : "Date commission et PV requis");
                  return;
                }

                // Validate expenses: all montant and fichier fields must be filled
                for (const sp of spectacles) {
                  for (const art of sp.artists) {
                    const keys = art.nationality === "tunisienne" ? ARTIST_TUNISIAN_KEYS : [...ARTIST_EXPENSE_KEYS];
                    for (const k of keys) {
                      if (!art.expenses[k].montant || !art.expenses[k].fichier) {
                        setErrorMsg(lang === "ar" ? "جميع حقول المصاريف (المبلغ والملف) مطلوبة" : "Tous les champs de dépenses (montant et fichier) sont obligatoires");
                        return;
                      }
                    }
                  }
                }

                const token = localStorage.getItem("token");
                const fd = new FormData();
                fd.append("numeroAutorisation", form.numeroAutorisation);
                fd.append("dateDemande", form.dateDemandeAutorisation);
                fd.append("isOrganisateur", String(form.isOrganisateur));
                fd.append("organisateurId", selectedOrganisateur || "");
                fd.append("sfat", form.qualite);
                fd.append("hasArtistesEtrangers", String(form.hasArtistesEtrangers));
                fd.append("dateCommission", form.dateCommission || "");
                fd.append("nombreSpectacles", nombreSpectacles);

                if (form.pvFile) fd.append("pvCommission", form.pvFile);

                fd.append("spectacles", JSON.stringify(
                  spectacles.map((sp) => ({
                    categorieSpectacle: sp.categorieSpectacle,
                    titreSpectacle: sp.titreSpectacle,
                    espaceSpectacle: sp.espaceSpectacle,
                    dateSpectacle: sp.dateSpectacle,
                    horaireSpectacle: sp.heureSpectacle,
                    lieuSpectacle: sp.lieuSpectacle,
                    typeSpectacle: sp.typeSpectacle,
                    budget: sp.budget || null,
                    natureManif: sp.natureTazahora || null,
                    hasEtrangers: sp.hasForeignShows === "oui",
                    artistes: sp.artists.map((art) => ({
                      nom: art.name,
                      nationalite: art.nationality,
                      pays: art.country || null,
                      depenses: Object.entries(art.expenses)
                        .filter(([, v]) => v.montant || v.fichier)
                        .map(([type, v]) => ({ type, montant: v.montant || 0 })),
                    })),
                  }))
                ));

                // Append titre/espace per spectacle
                spectacles.forEach((sp, i) => {
                  fd.append(`categorieSpectacle_${i}`, sp.categorieSpectacle);
                  fd.append(`titreSpectacle_${i}`, sp.titreSpectacle);
                  fd.append(`espaceSpectacle_${i}`, sp.espaceSpectacle);
                });

                // Append files per artiste
                spectacles.forEach((sp, i) => {
                  sp.artists.forEach((art, j) => {
                    if (art.identityFile) {
                      fd.append(`spectacle_${i}_artiste_${j}_identite`, art.identityFile);
                    }
                    Object.entries(art.expenses).forEach(([type, dep]) => {
                      if (dep.fichier) {
                        fd.append(`spectacle_${i}_artiste_${j}_depense_${type}`, dep.fichier);
                      }
                    });
                  });
                });

                setSubmitting(true);
                try {
                  const res = await fetch(`${API}/autorisations/spectacles`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd,
                  });
                  const data = await res.json();
                  if (!res.ok) { setErrorMsg(data.error || "Erreur"); return; }
                  navigate(`/autorisation/facture/${data.id}`);
                } catch {
                  setErrorMsg("Erreur réseau");
                } finally {
                  setSubmitting(false);
                }
              }}
              className="btn-primary"
              style={{ fontSize: "15px", padding: "10px 32px", opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? (lang === "ar" ? "جاري الإرسال..." : "Envoi en cours...") : t.submit}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default SpectaclesPage;
