import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import WorkflowStepper, { type AutorisationStatut } from "../../components/WorkflowStepper";

type Lang = "ar" | "fr";

interface Depense {
  id: number;
  type: string;
  montant: string | number;
  fichier?: string | null;
}

interface Artiste {
  id: number;
  nom: string;
  nationalite?: string | null;
  pays?: string | null;
  identite?: string | null;
  depenses?: Depense[];
}

interface Spectacle {
  id: number;
  categorieSpectacle?: string | null;
  titreSpectacle?: string | null;
  espaceSpectacle?: string | null;
  dateSpectacle: string;
  horaireSpectacle: string | null;
  lieuSpectacle: string;
  typeSpectacle: string;
  budget: number | string | null;
  natureManif: string | null;
  hasEtrangers?: boolean | null;
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
  organisateur: { id: number; nom: string; adresse: string | null } | null;
  spectacles: Spectacle[];
}

const API = import.meta.env.VITE_API_URL;

const sfatLabels: Record<string, { ar: string; fr: string }> = {
  'traiteur_evenementiel': { ar: 'متعهد حفلات',    fr: 'Organisateur de spectacles' },
  'espace_touristique':    { ar: 'فضاء سياحي',     fr: 'Espace touristique' },
  'salle_fetes':           { ar: 'قاعة أفراح',     fr: 'Salle des fêtes' },
  'salle_sport':           { ar: 'قاعة رياضة',     fr: 'Salle de sport' },
  'cafes_restaurants':     { ar: 'مقاهي + مطاعم',  fr: 'Cafés + Restaurants' },
  'transport':             { ar: 'وسائل نقل',      fr: 'Moyens de transport' },
  'structure_publique':    { ar: 'هيكل عمومي',     fr: 'Structure publique' },
};

const categorieLabels: Record<string, { ar: string; fr: string }> = {
  cirque:         { ar: "عروض الفرجة: السرك،...", fr: "cirque: cirque..." },
  theatre:    { ar: "المسرحيات",                fr: "Pièces de théâtre" },
  lyrique: { ar: "المسرح الغنائي",           fr: "Théâtre lyrique" },
  Concerts:  { ar: "الحفلات الموسيقية",        fr: "Concerts musicaux" },
  enregistrements:     { ar: "بواسطة المسجلات",          fr: "Par enregistrements" },
  orchestres:          { ar: "بواسطة الفرق",             fr: "Par orchestres" },
  piece_mus__films_:  { ar: "القطع الموسيقية المصاحبة للأشرطة", fr: "Pièces musicales accompagnant les films" },
  piece_mus_diff:  { ar: "القطع الموسيقية المذاعة في الفواصل", fr: "Pièces musicales diffusées dans les intervalles" },
};

const natureManifLabels: Record<string, { ar: string; fr: string }> = {
  locale:         { ar: "محلية",   fr: "Locale" },
  regional:       { ar: "جهوية",   fr: "Régionale" },
  regionale:      { ar: "جهوية",   fr: "Régionale" },
  nationale:      { ar: "وطنية",   fr: "Nationale" },
  internationale: { ar: "دولية",   fr: "Internationale" },
};

const typeSpectacleLabels: Record<string, { ar: string; fr: string }> = {
  individuel:    { ar: "عرض وحيد", fr: "Spectacle unique" },
  manifestation: { ar: "تظاهرة",    fr: "Manifestation" },
};

const nationaliteLabels: Record<string, { ar: string; fr: string }> = {
  tunisienne: { ar: "تونسية", fr: "Tunisienne" },
  autre:      { ar: "غيرها",  fr: "Autre" },
};

const depenseLabels: Record<string, { ar: string; fr: string }> = {
  // generic spectacle-level expenses
  contratArtiste:   { ar: "عقد الفنان",        fr: "Contrat de l'artiste" },
  contratGroupe:    { ar: "عقد الفرقة",         fr: "Contrat du groupe" },
  transportInt:     { ar: "التنقل الدولي",       fr: "Transport international" },
  transportInterne: { ar: "التنقل الداخلي",      fr: "Transport interne" },
  organisateur:     { ar: "متعهد الحفلات",       fr: "Organisateur de spectacles" },
  hebergement:      { ar: "الإقامة",             fr: "Hébergement" },
  decorEclairage:   { ar: "الديكور / الإضاءة",  fr: "Décor / Éclairage" },
  contratLocation:  { ar: "عقد كراء الفضاء",    fr: "Contrat de location d'espace" },
  autres:           { ar: "أخرى",               fr: "Autres" },
  // artist-level expenses
  remunerationArtistes:     { ar: "أجرة الفنانين",                  fr: "Rémunération des artistes" },
  remunerationGroupes:      { ar: "أجرة الفرق المصاحبة",            fr: "Rémunération des groupes d'accompagnement" },
  remunerationOrganisateur: { ar: "أجرة متعهد الحفلات",             fr: "Rémunération de l'organisateur de spectacles" },
  deplacements:             { ar: "التنقلات",                       fr: "Déplacements" },
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

const fmtMontant = (m: string | number | null | undefined): string => {
  if (m === null || m === undefined || m === "") return "—";
  const n = Number(m);
  if (!Number.isFinite(n)) return String(m);
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} DT`;
};

const fmt = (dateStr: string | null): string => {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const PreviewRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: "flex",
      gap: "12px",
      padding: "10px 12px",
      borderRadius: "6px",
    }}
    className="hover:bg-muted/40 transition-colors"
  >
    <span
      style={{
        fontSize: "12.5px",
        fontWeight: 600,
        color: "hsl(215 15% 50%)",
        minWidth: "140px",
        flexShrink: 0,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
    <span
      className="text-foreground"
      style={{ fontSize: "14px", fontWeight: 500, wordBreak: "break-word" }}
    >
      {value || "\u2014"}
    </span>
  </div>
);

const PreviewSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: "24px" }}>
    <div
      className="flex items-center gap-2 mb-3 pb-2 border-b"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: "4px", height: "18px", background: "hsl(215 60% 22%)" }}
      />
      <h3
        className="font-bold text-foreground tracking-tight"
        style={{ fontSize: "15px" }}
      >
        {title}
      </h3>
    </div>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const T = {
  ar: {
    topBarTitle: "OTDAV",
    back: "رجوع",
    pageTitle: "دفع مبلغ الترخيص",
    infoTitle: "معلومات الترخيص / Informations de l'autorisation",
    orgTitle: "المتعهد / Organisateur",
    specTitle: "العروض / Spectacles",
    numero: "رقم المطلب ",
    dateCreation: "تاريخ الإنشاء",
    nombreSpec: "عدد العروض",
    organisateur: "المتعهد",
    qualite: "الصفة",
    spectacleN: (n: number) => `العرض ${n}`,
    artisteN: (n: number) => `الفنان ${n}`,
    categorie: "صنف العرض",
    titre: "إسم العرض",
    espace: "فضاء العرض",
    dateHoraire: "التاريخ والتوقيت",
    date: "التاريخ",
    horaire: "التوقيت",
    lieu: "المكان",
    type: "النوع",
    artistes: "الفنانون",
    nombreArtistes: "عدد الفنانين",
    nationalite: "الجنسية",
    pays: "الدولة",
    budget: "الميزانية التقديرية",
    natureManif: "طبيعة التظاهرة",
    hasArtistesEtrangers: "فنانون أجانب",
    dateCommission: "تاريخ اللجنة",
    oui: "نعم",
    non: "لا",
    depensesTitle: "المصاريف",
    montant: "المبلغ",
    aucunArtiste: "لا يوجد فنانون",
    aucuneDepense: "لا توجد مصاريف",
    factureLabel: "ملف الفاتورة",
    chooseFile: "تحميل الوثيقة",
    noFile: "لم يتم اختيار ملف",
    fileTooLarge: "الملف أكبر من 5 ميغابايت",
    valider: "تأكيد",
    envoi: "جاري الإرسال...",
    successMsg: "تم تسجيل الدفع بنجاح",
    printReceipt: "طباعة الشهادة",
    loading: "جاري التحميل...",
    logout: "خروج",
    waitExamen: "الملف قيد الدراسة من قبل OTDAV",
    waitTraitement: "الملف قيد المعالجة من قبل OTDAV",
    waitValidation: "تم تسجيل دفعك، في انتظار تصديق OTDAV",
    delivered: "تم تسليم الترخيص",
    downloadCalcul: "تحميل جدول الاحتساب (PDF)",
    generating: "جاري إنشاء الملف...",
    downloadError: "تعذّر إنشاء ملف جدول الاحتساب، يرجى المحاولة مرة أخرى",
  },
  fr: {
    topBarTitle: "OTDAV",
    back: "Retour",
    pageTitle: "Paiement de l'autorisation",
    infoTitle: "Informations de l'autorisation / معلومات الترخيص",
    orgTitle: "Organisateur / المتعهد",
    specTitle: "Spectacles / العروض",
    numero: "N\u00b0 demande",
    dateCreation: "Date de cr\u00e9ation",
    nombreSpec: "Nombre de spectacles",
    organisateur: "Organisateur",
    qualite: "Qualit\u00e9",
    spectacleN: (n: number) => `Spectacle ${n}`,
    artisteN: (n: number) => `Artiste ${n}`,
    categorie: "Catégorie",
    titre: "Titre du spectacle",
    espace: "Espace",
    dateHoraire: "Date & Horaire",
    date: "Date",
    horaire: "Horaire",
    lieu: "Lieu",
    type: "Type",
    artistes: "Artistes",
    nombreArtistes: "Nombre d'artistes",
    nationalite: "Nationalité",
    pays: "Pays",
    budget: "Budget prévisionnel",
    natureManif: "Nature de la manifestation",
    hasArtistesEtrangers: "Artistes étrangers",
    dateCommission: "Date commission",
    oui: "Oui",
    non: "Non",
    depensesTitle: "Dépenses",
    montant: "Montant",
    aucunArtiste: "Aucun artiste",
    aucuneDepense: "Aucune dépense",
    factureLabel: "Fichier facture / ملف الفاتورة",
    chooseFile: "Choisir un fichier / تحميل الوثيقة",
    noFile: "Aucun fichier s\u00e9lectionn\u00e9",
    fileTooLarge: "Fichier sup\u00e9rieur \u00e0 5 Mo",
    valider: "Valider",
    envoi: "Envoi en cours...",
    successMsg: "Paiement enregistr\u00e9 avec succ\u00e8s",
    printReceipt: "Imprimer le certificat",
    loading: "Chargement...",
    logout: "D\u00e9connexion",
    waitExamen: "Votre dossier est en cours d'examen par l'OTDAV",
    waitTraitement: "Votre dossier est en cours de traitement par l'OTDAV",
    waitValidation: "Paiement enregistré, en attente de validation par l'OTDAV",
    delivered: "Autorisation délivrée",
    downloadCalcul: "Télécharger le tableau de calcul (PDF)",
    generating: "Génération du fichier...",
    downloadError: "Impossible de générer le tableau de calcul, veuillez réessayer",
  },
};

const AutorisationFacturePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("ar");
  const [autorisation, setAutorisation] = useState<Autorisation | null>(null);
  const [factureFile, setFactureFile] = useState<File | null>(null);
  const [numeroFacture, setNumeroFacture] = useState("");
  const [fileError, setFileError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calculLoading, setCalculLoading] = useState(false);
  const [calculError, setCalculError] = useState("");
  const factureInputRef = useRef<HTMLInputElement>(null);

  const t = T[lang];
  const isRtl = lang === "ar";

  const fetchAutorisation = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch(`${API}/autorisations/spectacles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && data.id) setAutorisation(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    fetchAutorisation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const handleSubmit = async () => {
    setError("");
    setFileError("");
    if (!numeroFacture.trim()) {
      setError(lang === "ar" ? "رقم الفاتورة مطلوب" : "Le numéro de facture est obligatoire");
      return;
    }
    if (!factureFile) {
      setFileError(lang === "ar" ? "يرجى إرفاق ملف الفاتورة" : "Veuillez joindre le fichier facture");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("fichierFacture", factureFile);
      fd.append("numeroFacture", numeroFacture);
      const res = await fetch(`${API}/autorisations/spectacles/${id}/payer`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSuccess(true);
      await fetchAutorisation();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCalculDA = async () => {
    if (!autorisation) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    setCalculError("");
    setCalculLoading(true);
    try {
      const res = await fetch(`${API}/autorisations/spectacles/${autorisation.id}/calcul-da`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setCalculError(t.downloadError);
    } finally {
      setCalculLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!autorisation) return;

    const isTheatre = autorisation.spectacles.some(
      (sp) => sp.typeSpectacle === "manifestation" || sp.typeSpectacle?.includes("مسرح")
    );

    const dateFormatted = autorisation.dateDemande ? fmt(autorisation.dateDemande) : fmt(autorisation.dateCreation);
    const sfatDisplay = autorisation.sfat ? (sfatLabels[autorisation.sfat]?.ar || autorisation.sfat) : "";
    const demandeur = autorisation.organisateur?.nom || sfatDisplay;
    const adresse = autorisation.organisateur?.adresse || "";
    const sp0 = autorisation.spectacles[0];
    console.log('spectacle:', sp0);
    const artisteNames = sp0
      ? sp0.artistes.map((a) => a.nom).filter(Boolean).join(" / ")
      : "";
    const lieu = sp0?.lieuSpectacle || "";
    const dateSpectacle = sp0 ? fmt(sp0.dateSpectacle) : "";
    const horaire = sp0?.horaireSpectacle || "";
    const numAut = autorisation.numeroAutorisation || "";

    const rate = isTheatre ? "12%" : "8,8%";
    const subtitle = isTheatre
      ? "لإستغلال مصنفات مسرحية، خلال العرض المسرحي"
      : "لإستغلال مصنفات موسيقيّة، خلال حفل فني عمومي";
    const artisteIntro = isTheatre
      ? `في إستغلال مصنفات مسرحية خلال العرض المسرحي الذي يـ(تـ) حييه الفرقة / الممثّل (ـة) ${artisteNames}`
      : `في إستغلال مصنفات موسيقيّة (كلمات وألحان) خلال الحفل الفني العمومي الذي يـ(تـ) حييه الفنانون ${artisteNames}`;
    const ticketLabel = isTheatre ? "تذاكر العرض" : "تذاكر الحفل";
    const rightsLabel = isTheatre ? "حقوق المؤلف" : "حقوق المؤلفين والملحنين";
    const eventWord = isTheatre ? "العرض" : "الحفل";
    const adressePrefix = isTheatre ? "بنهج" : "بـ";
    const worksLabel = isTheatre
      ? "قائمة مفصلة في المصنفات التي تمّ عرضها مع بيان أسماء المؤلفين"
      : "قائمة مفصلة في برنامج الحفل يتضمّن الأغاني التي تمّ عرضها مع بيان أسماء المؤلفين والملحنين";
    const noteBase = isTheatre
      ? `من كافة المبالغ المتصلة بتنظيم العرض بما في ذلك مستحقات الفنان المالية والإمتيازات العينية.`
      : `من كافة المبالغ المتصلة بتنظيم الحفل بما في ذلك مستحقات الفنان المالية والإمتيازات العينية.`;

    const html = `<div style="font-family:'Traditional Arabic','Simplified Arabic','Geeza Pro',Arial,sans-serif;font-size:16px;line-height:2;color:#000;direction:rtl;text-align:right;padding:60px;">
  <p style="text-align:left;margin-bottom:24px;font-size:15px;">تونس في ${dateFormatted}</p>

  <div style="text-align:center;margin:30px 0 10px;">
    <p style="font-size:20px;font-weight:bold;margin-bottom:4px;">ترخيص في حق المؤلفين والملحنين</p>
    <p style="font-size:18px;font-weight:bold;">${subtitle}</p>
  </div>

  <p style="margin-bottom:12px;">إن المدير العام للمؤسسة التونسية لحقوق المؤلف والحقوق المجاورة،</p>

  <p style="text-align:justify;margin-bottom:8px;text-indent:1em;">بناء على أحكام القانون عدد 36 لسنة 1994 المؤرخ في 24 فيفري 1994، المتعلق بالملكية الأدبية والفنية، المنقح والمتمم بالقانون عدد 33 لسنة 2009، المؤرخ في 23 جوان 2009،</p>

  <p style="text-align:justify;margin-bottom:8px;text-indent:1em;">وعلى الأمر عدد 2860 لسنة 2013 المؤرخ في 01 جويلية 2013، المتعلق بإحداث المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة وضبط تنظيمها الإداري والمالي وطرق تسييرها،</p>

  <p style="text-align:justify;margin-bottom:8px;text-indent:1em;">وعلى النظام الداخلي للمؤسسة التونسية لحقوق المؤلف والحقوق المجاورة، وخاصة منه تعريفة إستخلاص حقوق المؤلف.</p>

  <p style="text-align:justify;margin-bottom:16px;text-indent:1em;">وعلى المطلب عدد <b>${numAut}</b> المؤرّخ في <b>${dateFormatted}</b>، المقدّمة من قبل <b>${demandeur}</b>.</p>

  <div id="yarakhkhes-placeholder" style="text-align:center;margin:28px 0;height:40px;"></div>

  <p style="margin-bottom:8px;">لـ <b>${demandeur}</b> الكائن مقره (ها) ${adressePrefix} <b>${adresse}</b></p>
  <p style="margin-bottom:8px;">${artisteIntro}</p>
  <p style="margin-bottom:16px;">بـ <b>${lieu}</b> يوم <b>${dateSpectacle}</b> على الساعة <b>${horaire}</b></p>

  <p style="margin-bottom:16px;">يدفع المرخص له مقابلا حدد بنسبة <b>${rate}</b> من مداخيل بيع ${ticketLabel}، بعنوان ${rightsLabel}</p>

  <p style="margin-bottom:8px;">و ذلك على النحو التالي :</p>
  <p style="margin-bottom:6px;padding-right:16px;">- دفع مبلغ .................. كتسبقة عند تسلم هذا الترخيص، يعدّ حدّا أدنى للمستحقات.</p>
  <p style="margin-bottom:16px;padding-right:16px;">- دفع ما تبقى من المستحقات خلال الخمسة عشرة يوما الموالية لإقامة ${eventWord}.</p>

  <p style="text-align:justify;margin-bottom:20px;">يجب على المرخص له تقديم المؤيدات اللآّزمة وخاصة منها قائمة المداخيل، و${worksLabel} وذلك في أجل لا يتعدّى الخمسة عشرة يوما الموالية لتاريخ إقامة ${eventWord}.</p>

  <div style="font-size:13px;color:#333;border-top:1px solid #ccc;padding-top:12px;margin-top:20px;">
    <p style="margin-bottom:4px;">(1) هذا الترخيص يتعلق بحق المؤلف فحسب، ولا يعفي من الحصول على التراخيص القانونيّة الأخرى المستوجبة.</p>
    <p>(2) يحدد مبلغ التسبقة على أساس <b>${rate}</b> ${noteBase}</p>
  </div>
</div>`;

    const container = document.createElement("div");
    container.innerHTML = html;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.boxSizing = "border-box";
    container.style.backgroundColor = "#fff";
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Overlay "يــرخّــص" with canvas 2D for proper Arabic shaping
      const placeholder = container.querySelector("#yarakhkhes-placeholder");
      if (placeholder) {
        const rect = placeholder.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetY = rect.top - containerRect.top;
        const scale = imgWidth / container.offsetWidth;
        const yMm = offsetY * scale;

        const titleCanvas = document.createElement("canvas");
        titleCanvas.width = 800;
        titleCanvas.height = 60;
        const ctx = titleCanvas.getContext("2d")!;
        ctx.font = "bold 32px 'Traditional Arabic','Simplified Arabic',Arial,sans-serif";
        ctx.direction = "rtl";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText("يــرخّــص", 400, 42);

        const titleImg = titleCanvas.toDataURL("image/png");
        const titleWidthMm = imgWidth * 0.5;
        const titleHeightMm = (60 / 800) * titleWidthMm;
        const titleX = (imgWidth - titleWidthMm) / 2;
        doc.addImage(titleImg, "PNG", titleX, yMm, titleWidthMm, titleHeightMm);
      }

      // QR Code placeholder at bottom right
      const pageWidth = doc.internal.pageSize.getWidth();
      const qrX = pageWidth - 60;
      const qrY = doc.internal.pageSize.getHeight() - 60;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(qrX, qrY, 40, 40);

      doc.setFontSize(8);
      doc.text('QR Code', qrX + 20, qrY + 50, { align: 'center' });

      const d = new Date(autorisation.dateCreation);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      doc.save(`certificat-autorisation-${numAut || autorisation.id}-${dd}-${mm}-${yyyy}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div
        className="flex-shrink-0 border-b border-border/60 sticky top-0 z-30"
        style={{
          background: "linear-gradient(180deg, hsl(215 60% 22%) 0%, hsl(215 60% 18%) 100%)",
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.18)",
        }}
        dir="ltr"
      >
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="/otdav-logo.png"
              alt="OTDAV"
              className="h-9 w-9 object-contain rounded bg-white/95 p-1"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-semibold tracking-tight" style={{ fontSize: "15px" }}>
                {t.topBarTitle}
              </span>
              <span className="text-white/55" style={{ fontSize: "11px" }}>
                {lang === "ar" ? "بوابة الترخيص" : "Portail d'autorisation"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language toggle */}
            <div
              className="flex items-center rounded-full p-0.5"
              style={{ background: "hsla(0,0%,100%,0.12)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)" }}
            >
              <button
                onClick={() => setLang("ar")}
                className="px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200"
                style={
                  lang === "ar"
                    ? { background: "white", color: "hsl(215 60% 22%)", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }
                    : { background: "transparent", color: "rgba(255,255,255,0.75)" }
                }
              >
                عربي
              </button>
              <button
                onClick={() => setLang("fr")}
                className="px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200"
                style={
                  lang === "fr"
                    ? { background: "white", color: "hsl(215 60% 22%)", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }
                    : { background: "transparent", color: "rgba(255,255,255,0.75)" }
                }
              >
                FR
              </button>
            </div>
            <button
              onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); }}
              className="flex items-center gap-1.5 text-sm text-white/75 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Back button + page title */}
      <div className="max-w-[90%] mx-auto w-full px-4 pt-5 flex items-center justify-between gap-4" dir={isRtl ? "rtl" : "ltr"}>
        <button
          onClick={() => navigate("/dashboard/autorisation")}
          className="flex items-center gap-2 text-muted-foreground font-semibold hover:text-foreground transition-colors group"
          style={{ fontSize: "14px" }}
          dir="ltr"
        >
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full border transition-colors group-hover:border-primary/40 group-hover:bg-primary/5"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          <span>{t.back}</span>
        </button>
        <h1 className="font-bold text-foreground tracking-tight hidden sm:block" style={{ fontSize: "16px" }}>
          {t.pageTitle}
        </h1>
      </div>

      {/* Workflow stepper */}
      {autorisation && (
        <div className="max-w-[90%] mx-auto w-full px-4 pt-4">
          <WorkflowStepper statut={autorisation.statut} />
        </div>
      )}

      {/* Main two-column layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 md:p-8" dir={isRtl ? "rtl" : "ltr"}>

        {/* LEFT - Autorisation preview */}
        <div className="w-full md:w-1/2">
          <div
            className="paper-form overflow-hidden flex flex-col"
            style={{ height: "calc(100vh - 180px)", minHeight: "100%" }}
          >
            <div
              className="flex items-center gap-3 px-6 py-3 border-b border-border flex-shrink-0"
              style={{
                background: "linear-gradient(90deg, hsl(215 45% 94%) 0%, hsl(215 45% 96%) 100%)",
              }}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: "4px", height: "20px", background: "hsl(215 60% 22%)" }}
              />
              <h2 className="font-bold text-foreground tracking-tight" style={{ fontSize: "16px" }}>
                {lang === "ar" ? "ملخص الطلب" : "Aperçu de la demande"}
              </h2>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
            {!autorisation ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  {t.loading}
                </div>
              </div>
            ) : (
              <>
                {/* Info section */}
                <PreviewSection title={t.infoTitle}>
                  <PreviewRow label={t.numero} value={autorisation.numeroAutorisation || "\u2014"} />
                  <PreviewRow
                    label={t.dateCreation}
                    value={fmt(autorisation.dateDemande || autorisation.dateCreation)}
                  />
                  <PreviewRow label={t.nombreSpec} value={String(autorisation.nombreSpectacles)} />
                  <PreviewRow
                    label={t.hasArtistesEtrangers}
                    value={autorisation.hasArtistesEtrangers ? t.oui : t.non}
                  />
                  {autorisation.hasArtistesEtrangers && autorisation.dateCommission && (
                    <PreviewRow label={t.dateCommission} value={fmt(autorisation.dateCommission)} />
                  )}
                </PreviewSection>

                {/* Organisateur section */}
                <PreviewSection title={t.orgTitle}>
                  {autorisation.isOrganisateur && autorisation.organisateur ? (
                    <>
                      <PreviewRow label={t.organisateur} value={autorisation.organisateur.nom} />
                      {autorisation.organisateur.adresse && (
                        <PreviewRow label={t.lieu} value={autorisation.organisateur.adresse} />
                      )}
                    </>
                  ) : (
                    <PreviewRow
                      label={t.qualite}
                      value={
                        autorisation.sfat
                          ? sfatLabels[autorisation.sfat]?.[lang] || autorisation.sfat
                          : "\u2014"
                      }
                    />
                  )}
                </PreviewSection>

                {/* Spectacles section */}
                <PreviewSection title={t.specTitle}>
                  <div className="space-y-4">
                    {autorisation.spectacles.map((sp, i) => (
                      <div
                        key={sp.id}
                        className="rounded-lg border overflow-hidden"
                        style={{ borderColor: "hsl(var(--border))" }}
                      >
                        <div
                          className="px-3 py-2 flex items-center gap-2 border-b"
                          style={{
                            background: "linear-gradient(90deg, hsl(215 35% 90%) 0%, hsl(215 35% 93%) 100%)",
                            borderColor: "hsl(var(--border))",
                          }}
                        >
                          <span
                            className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                            style={{
                              width: "22px",
                              height: "22px",
                              fontSize: "11px",
                              background: "hsl(215 60% 22%)",
                            }}
                          >
                            {i + 1}
                          </span>
                          <h4
                            className="font-bold text-foreground tracking-tight"
                            style={{ fontSize: "13.5px" }}
                          >
                            {t.spectacleN(i + 1)}
                          </h4>
                        </div>
                        <div className="px-2 py-1.5">
                          {sp.categorieSpectacle && (
                            <PreviewRow
                              label={t.categorie}
                              value={
                                categorieLabels[sp.categorieSpectacle]?.[lang] ||
                                sp.categorieSpectacle
                              }
                            />
                          )}
                          {sp.titreSpectacle && (
                            <PreviewRow label={t.titre} value={sp.titreSpectacle} />
                          )}
                          {sp.espaceSpectacle && (
                            <PreviewRow label={t.espace} value={sp.espaceSpectacle} />
                          )}
                          <PreviewRow label={t.date} value={fmt(sp.dateSpectacle)} />
                          {sp.horaireSpectacle && (
                            <PreviewRow label={t.horaire} value={sp.horaireSpectacle} />
                          )}
                          <PreviewRow label={t.lieu} value={sp.lieuSpectacle} />
                          <PreviewRow
                            label={t.type}
                            value={
                              typeSpectacleLabels[sp.typeSpectacle]?.[lang] || sp.typeSpectacle
                            }
                          />
                          {sp.typeSpectacle === "manifestation" && (
                            <>
                              {sp.budget !== null && sp.budget !== undefined && (
                                <PreviewRow
                                  label={t.budget}
                                  value={fmtMontant(sp.budget)}
                                />
                              )}
                              {sp.natureManif && (
                                <PreviewRow
                                  label={t.natureManif}
                                  value={
                                    natureManifLabels[sp.natureManif]?.[lang] || sp.natureManif
                                  }
                                />
                              )}
                            </>
                          )}
                          <PreviewRow
                            label={t.nombreArtistes}
                            value={String(sp.artistes.length)}
                          />
                        </div>

                        {/* Artistes \u2014 name, nationality, pays + depenses table per artist */}
                        {sp.artistes.length > 0 && (
                          <div
                            className="border-t px-3 py-3 space-y-3"
                            style={{
                              borderColor: "hsl(var(--border))",
                              background: "hsl(215 30% 98%)",
                            }}
                          >
                            <p
                              className="uppercase tracking-wider font-semibold"
                              style={{ color: "hsl(215 15% 50%)", fontSize: "11px" }}
                            >
                              {t.artistes} ({sp.artistes.length})
                            </p>
                            {sp.artistes.map((art, aIdx) => {
                              const depenses = art.depenses || [];
                              const totalArt = depenses.reduce(
                                (s, d) => s + Number(d.montant || 0),
                                0,
                              );
                              return (
                                <div
                                  key={art.id}
                                  className="rounded-lg border bg-white overflow-hidden"
                                  style={{ borderColor: "hsl(var(--border))" }}
                                >
                                  <div className="px-3 py-2 flex items-center justify-between gap-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                                        style={{
                                          width: "20px",
                                          height: "20px",
                                          fontSize: "10px",
                                          background: "hsl(215 60% 22%)",
                                        }}
                                      >
                                        {aIdx + 1}
                                      </span>
                                      <span
                                        className="font-semibold text-foreground truncate"
                                        style={{ fontSize: "13px" }}
                                      >
                                        {art.nom || t.artisteN(aIdx + 1)}
                                      </span>
                                    </div>
                                    {art.nationalite && (
                                      <span
                                        className="px-1.5 py-0.5 rounded flex-shrink-0"
                                        style={{
                                          background:
                                            art.nationalite === "tunisienne"
                                              ? "hsl(215 45% 90%)"
                                              : "hsl(215 25% 88%)",
                                          color: "hsl(215 60% 22%)",
                                          fontSize: "10.5px",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {nationaliteLabels[art.nationalite]?.[lang] ||
                                          art.nationalite}
                                      </span>
                                    )}
                                  </div>
                                  <div className="px-2 py-1.5">
                                    {art.pays && (
                                      <PreviewRow label={t.pays} value={art.pays} />
                                    )}
                                  </div>

                                  {/* Depenses table per artist */}
                                  <div
                                    className="border-t"
                                    style={{ borderColor: "hsl(var(--border))" }}
                                  >
                                    <div
                                      className="px-3 py-2 flex items-center justify-between gap-2"
                                      style={{
                                        background:
                                          "linear-gradient(90deg, hsl(215 35% 90%) 0%, hsl(215 35% 93%) 100%)",
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="inline-block rounded-full"
                                          style={{
                                            width: "3px",
                                            height: "12px",
                                            background: "hsl(215 60% 22%)",
                                          }}
                                        />
                                        <span
                                          className="font-bold text-foreground"
                                          style={{ fontSize: "12px" }}
                                        >
                                          {t.depensesTitle}
                                        </span>
                                      </div>
                                      {depenses.length > 0 && (
                                        <span
                                          className="font-bold"
                                          style={{
                                            color: "hsl(215 60% 22%)",
                                            fontSize: "12px",
                                          }}
                                        >
                                          {fmtMontant(totalArt)}
                                        </span>
                                      )}
                                    </div>
                                    {depenses.length === 0 ? (
                                      <p
                                        className="px-3 py-2 text-muted-foreground"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {t.aucuneDepense}
                                      </p>
                                    ) : (
                                      <div>
                                        {depenses.map((d, dIdx) => (
                                          <div
                                            key={d.id}
                                            className="flex items-center justify-between gap-3 px-3 py-1.5"
                                            style={{
                                              borderTop:
                                                dIdx > 0
                                                  ? "1px solid hsl(var(--border) / 0.5)"
                                                  : undefined,
                                              background:
                                                dIdx % 2 === 0
                                                  ? "transparent"
                                                  : "hsl(215 30% 97%)",
                                            }}
                                          >
                                            <span
                                              className="text-foreground"
                                              style={{ fontSize: "12px" }}
                                            >
                                              {depenseLabels[d.type]?.[lang] || d.type}
                                            </span>
                                            <span
                                              className="font-semibold flex-shrink-0"
                                              style={{
                                                fontSize: "12px",
                                                color: "hsl(215 60% 22%)",
                                              }}
                                            >
                                              {fmtMontant(d.montant)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </PreviewSection>
              </>
            )}
            </div>
          </div>
        </div>

        {/* RIGHT - Facture card */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="paper-form w-full max-w-lg overflow-hidden">
            {/* Card header strip */}
            <div
              className="flex items-center gap-3 px-6 py-3 border-b border-border"
              style={{
                background: "linear-gradient(90deg, hsl(215 45% 94%) 0%, hsl(215 45% 96%) 100%)",
              }}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: "4px", height: "20px", background: "hsl(215 60% 22%)" }}
              />
              <h2 className="font-bold text-foreground tracking-tight" style={{ fontSize: "16px" }}>
                {lang === "ar" ? "الدفع" : "Paiement"}
              </h2>
            </div>

            <div className="p-8">
              {/* Header */}
              <div className="flex flex-col items-center mb-7">

                <h1 className="text-xl font-bold text-foreground text-center tracking-tight">
                  {t.pageTitle}
                </h1>
              </div>

            {/* Montant — total des dépenses déclarées dans تفاصيل المصاريف / تكاليف الأجانب */}
            <div
              className="mb-6 px-5 py-4 rounded-xl border text-center"
              style={{
                background: "linear-gradient(135deg, hsl(215 45% 96%) 0%, hsl(215 45% 92%) 100%)",
                borderColor: "hsl(215 45% 80%)",
              }}
            >
              <p
                className="uppercase tracking-wider font-semibold mb-1"
                style={{ color: "hsl(215 15% 50%)", fontSize: "11px" }}
              >
                {t.montant}
              </p>
              <p
                className="font-bold tracking-tight"
                style={{ fontSize: "26px", color: "hsl(215 60% 22%)" }}
              >
                {(() => {
                  if (!autorisation) return "—";
                  const total = autorisation.spectacles.reduce(
                    (s, sp) =>
                      s +
                      sp.artistes.reduce(
                        (ss, ar) =>
                          ss + (ar.depenses || []).reduce((sss, d) => sss + Number(d.montant || 0), 0),
                        0,
                      ),
                    0,
                  );
                  return `${total.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} DT`;
                })()}
              </p>
            </div>

            {/* Calcul DA download — always available once the autorisation exists */}
            {autorisation && (
              <div className="mb-6">
                <button
                  onClick={handleDownloadCalculDA}
                  disabled={calculLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg border transition-all duration-200 disabled:opacity-60"
                  style={{
                    borderColor: "hsl(215, 60%, 22%)",
                    color: calculLoading ? "hsl(215 15% 50%)" : "hsl(215 60% 22%)",
                    background: "hsla(215, 60%, 22%, 0.04)",
                  }}
                >
                  {calculLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <span>{t.generating}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M4 4h16v4H4z" />
                      </svg>
                      <span>{t.downloadCalcul}</span>
                    </>
                  )}
                </button>
                {calculError && (
                  <p className="text-destructive text-xs mt-2 text-center">{calculError}</p>
                )}
              </div>
            )}

            {/* Wait: en cours d'examen */}
            {autorisation?.statut === "EN_COURS_EXAMEN" && (
              <div
                className="flex items-center gap-3 px-4 py-4 rounded-lg border"
                style={{
                  background: "hsl(215 30% 97%)",
                  borderColor: "hsl(var(--border))",
                }}
              >
                <span
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "hsl(215 25% 90%)",
                    color: "hsl(215 15% 45%)",
                  }}
                >
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="text-sm font-medium" style={{ color: "hsl(215 15% 35%)" }}>
                  {t.waitExamen}
                </p>
              </div>
            )}

            {/* Wait: en cours de traitement */}
            {autorisation?.statut === "EN_COURS_TRAITEMENT" && (
              <div
                className="flex items-center gap-3 px-4 py-4 rounded-lg border"
                style={{
                  background: "hsl(215 45% 96%)",
                  borderColor: "hsl(215 45% 85%)",
                }}
              >
                <span
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "hsl(215 60% 22%)",
                    color: "white",
                  }}
                >
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="text-sm font-medium" style={{ color: "hsl(215 60% 22%)" }}>
                  {t.waitTraitement}
                </p>
              </div>
            )}

            {/* Facture number + file upload — only when payment awaited */}
            {autorisation?.statut === "EN_ATTENTE_PAIEMENT" && !success && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === "ar" ? "رقم الفاتورة" : "Numéro de facture"} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={numeroFacture}
                      onChange={(e) => setNumeroFacture(e.target.value)}
                      placeholder={lang === "ar" ? "أدخل رقم الفاتورة" : "Saisir le numéro de facture"}
                      className="input-field w-full"
                      style={{ fontSize: "14px" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t.factureLabel} <span className="text-destructive">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative inline-block">
                        <input
                          ref={factureInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            if (f && f.size > 5 * 1024 * 1024) {
                              setFileError(t.fileTooLarge);
                              return;
                            }
                            setFactureFile(f);
                            setFileError("");
                            if (error) setError("");
                          }}
                          style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }}
                        />
                        <button
                          type="button"
                          onClick={() => factureInputRef.current?.click()}
                          disabled={loading}
                          style={{
                            background: "hsl(var(--primary))",
                            color: "white",
                            borderRadius: "6px",
                            padding: "6px 16px",
                            fontSize: "14px",
                            fontWeight: 500,
                            border: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.chooseFile}
                        </button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {factureFile ? `${factureFile.name} (${(factureFile.size / 1024).toFixed(0)} Ko)` : t.noFile}
                      </span>
                    </div>
                  </div>
                </div>
                {fileError && (
                  <div
                    className="px-3 py-2 rounded-lg flex items-center gap-2 border"
                    style={{
                      background: "hsl(0 65% 97%)",
                      color: "hsl(0 65% 35%)",
                      borderColor: "hsl(0 65% 88%)",
                    }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span className="text-sm font-medium">{fileError}</span>
                  </div>
                )}
                {error && (
                  <div
                    className="px-3 py-2 rounded-lg flex items-center gap-2 border"
                    style={{
                      background: "hsl(0 65% 97%)",
                      color: "hsl(0 65% 35%)",
                      borderColor: "hsl(0 65% 88%)",
                    }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      {t.envoi}
                    </>
                  ) : t.valider}
                </button>
              </div>
            )}

            {/* Paiement reçu — awaiting OTDAV validation */}
            {autorisation?.statut === "PAIEMENT_RECU" && (
              <div className="space-y-3">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                  style={{
                    background: "hsl(150 50% 96%)",
                    borderColor: "hsl(150 50% 85%)",
                  }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "hsl(150 60% 30%)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-sm" style={{ color: "hsl(150 60% 25%)" }}>
                    {t.successMsg}
                  </p>
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                  style={{
                    background: "hsl(215 30% 97%)",
                    borderColor: "hsl(var(--border))",
                  }}
                >
                  <svg className="w-5 h-5 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "hsl(215 60% 22%)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: "hsl(215 15% 35%)" }}>
                    {t.waitValidation}
                  </p>
                </div>
              </div>
            )}

            {/* Autorisation délivrée — print certificate */}
            {autorisation?.statut === "AUTORISE" && (
              <div className="space-y-5">
                <div
                  className="flex items-center gap-3 px-4 py-4 rounded-lg border"
                  style={{
                    background: "hsl(150 50% 96%)",
                    borderColor: "hsl(150 50% 85%)",
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "hsl(150 60% 35%)",
                      color: "white",
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="font-semibold text-base" style={{ color: "hsl(150 60% 25%)" }}>
                    {t.delivered}
                  </p>
                </div>
                <button
                  onClick={generateCertificate}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-base font-bold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, hsl(215 60% 22%) 0%, hsl(215 60% 28%) 100%)",
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  {t.printReceipt}
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AutorisationFacturePage;
