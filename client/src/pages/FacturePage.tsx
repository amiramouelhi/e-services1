import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Depot {
  id: number;
  numeroSequentiel: number | null;
  dateDepot: string;
  dateRenouvellement: string | null;
  montant: number;
  deposant: { nomComplet_fr?: string; nomComplet_ar?: string; raisonSociale?: string };
  oeuvre: {
    titre_fr?: string;
    titre_ar?: string;
    description_fr?: string;
    description_ar?: string;
    typeSupport_fr?: string;
    typeSupport_ar?: string;
    categorie: { code: string; nom_fr: string; nom_ar: string };
  };
  auteurs: { auteur: { nomComplet_fr?: string; nomComplet_ar?: string } }[];
}

interface CertData {
  dateFormatted: string;
  endDateFormatted: string;
  certNum: string;
  deposantName: string;
  title: string;
  description: string;
  auteurs: string;
  support: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildFrenchHTML(d: CertData): string {
  return `<div style="font-family:'Times New Roman',Georgia,serif;font-size:12px;line-height:1.7;color:#000;">
  <p style="text-align:right;margin-bottom:20px;">Tunis le ${esc(d.dateFormatted)}</p>
  <h3 style="text-align:center;font-size:17px;margin:24px 0;text-decoration:underline;font-weight:bold;">ATTESTATION DE DÉPÔT</h3>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">  Vu la loi n° 94-36, du 24 février 1994, relative à la propriété littéraire et artistique, telle que modifiée et complétée par la loi n° 2009-33 du 23 Juin 2009,</p>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">  Vu le décret n°2013-2860 du 1er juillet 2013, relatif à la création de l'organisme tunisien des droits d'auteur et des droits voisins et fixant son organisation administrative et financière et ses modalités de fonctionnement,</p>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">  Vu le règlement intérieur de l'organisme tunisien des droits d'auteurs et des droits voisins approuvé par le ministre de la culture et de la sauvegarde du patrimoine le 6 novembre 2006 et la règlementation en vigueur,</p>
  <p style="text-align:justify;margin-bottom:14px;font-size:14px;text-indent: 1em;font-weight: bold;">Le directeur général de l'organisme tunisien des droits d'auteur et des droits voisins (OTDAV) atteste que :</p>
  <div style="margin-bottom:16px;">
    <p style="margin-bottom:5px;">- Monsieur/Madame <b>${esc(d.deposantName)}</b></p>
    <p style="margin-bottom:5px;">- a déposé auprès de l'OTDAV en date du <b>${esc(d.dateFormatted)}</b></p>
    <p style="margin-bottom:5px;">- sous le numéro <b>${esc(d.certNum)}</b></p>
    <p style="margin-bottom:5px;">- l'œuvre (résumé succinct selon la déclaration du déposant): <b>${esc(d.description)}</b></p>
    <p style="margin-bottom:5px;">- Au nom du présumé auteur: <b>${esc(d.auteurs)}</b></p>
    <p style="margin-bottom:5px;">- Intitulé de l'œuvre: &quot;<b>${esc(d.title)}</b>&quot;</p>
    <p style="margin-bottom:5px;">- Sur support: <b>${esc(d.support)}</b></p>
    <p style="margin-bottom:5px;">- Durée de validité du dépôt: Du <b>${esc(d.dateFormatted)}</b> au <b>${esc(d.endDateFormatted)}</b></p>
    <p style="margin-bottom:5px;">- Date limite du renouvellement de dépôt: <b>${esc(d.endDateFormatted)}</b></p>
  </div>
  <p style="text-align:justify;margin-bottom:20px;font-style: italic;text-indent: 3em;">Cette attestation est délivrée au déposant pour servir et valoir ce que de droit.</p>
  <div style="font-size:11px;color:#333;border-top:1px solid #ccc;padding-top:10px;">
    <p style="margin-bottom:2px;"><b>NB:</b></p>
    <p style="margin-bottom:2px;">- L'OTDAV n'est que le dépositaire de l'œuvre et n'assume aucune responsabilité liée à la propriété de l'œuvre ou son contenu ou aux altérations du support.</p>
    <p>- Cette attestation ne remplace pas les redevances revendiquées au titre de droit d'auteur pour l'exploitation des œuvres et elle ne peut pas être présentée au Fonds d'encouragement à la création littéraire et artistique comme une licence de droit d'auteur.</p>
  </div>
</div>`;
}

function buildArabicHTML(d: CertData): string {
  return `<div style="font-family:'Traditional Arabic','Simplified Arabic','Geeza Pro',Arial,sans-serif;font-size:16px;line-height:1.9;color:#000;direction:rtl;text-align:right;">
  <p style="text-align:left;margin-bottom:20px;">تونس في ${esc(d.dateFormatted)}</p>
  <div id="ar-title-placeholder" style="text-align:center;font-size:20px;margin:24px 0;height:30px;"></div>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">بناء على أحكام القانون عدد 36 لسنة 1994 المتعلق بالملكية الأدبية و الفنية المؤرخ في 24 فيفري 1994 المنقح والمتمم بالقانون عدد 33 لسنة 2009 المؤرخ في 23 جوان 2009،</p>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">والأمر عدد 2860 لسنة 2013 المتعلق بإحداث المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة وضبط تنظيمها الإداري والمالي وطرق تسييرها المؤرخ في 1 جويلية 2013،</p>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">والنظام الداخلي للمؤسسة التونسية لحقوق المؤلف والحقوق المجاورة المصادق عليه من قبل وزير الثقافة والمحافظة على التراث في 6 نوفمبر 2006 و التراتيب الجاري بها العمل.</p>
  <p style="text-align:justify;margin-bottom:14px;text-indent: 1em;font-weight: bold;">يشهد المدير العام للمؤسسة التونسية لحقوق المؤلف والحقوق المجاورة أنّ:</p>
  <div style="margin-bottom:16px;padding-right:10px;">
    <p style="margin-bottom:5px;">- السيّد(ة) <b>${esc(d.deposantName)}</b></p>
    <p style="margin-bottom:5px;">- أودع لدى المؤسسة في تاريخ <b>${esc(d.dateFormatted)}</b></p>
    <p style="margin-bottom:5px;">- تحت عدد <b>${esc(d.certNum)}</b></p>
    <p style="margin-bottom:5px;">- مصنفا يحمل عنوان: &quot;<b>${esc(d.title)}</b>&quot;</p>
    <p style="margin-bottom:5px;">- وصف مختصر لمحتوى المصنف (حسب تصريح المودع): <b>${esc(d.description)}</b></p>
    <p style="margin-bottom:5px;">- لمؤلفه المفترض: <b>${esc(d.auteurs)}</b></p>
    <p style="margin-bottom:5px;">- محمول على: <b>${esc(d.support)}</b></p>
    <p style="margin-bottom:5px;">- مدة صلوحية الإيداع: من <b>${esc(d.dateFormatted)}</b> إلى <b>${esc(d.endDateFormatted)}</b></p>
    <p style="margin-bottom:5px;">- آخر آجال تجديد إيداع المصنف: <b>${esc(d.endDateFormatted)}</b></p>
  </div>
  <p style="text-align:justify;margin-bottom:20px;text-indent: 3em;">سلمت هذه الشهادة للمودع(ة) لما عساه أن يكون صالحا قانونا.</p>
  <div style="font-size:13px;color:#333;border-top:1px solid #ccc;padding-top:10px;">
    <p style="margin-bottom:2px;"><b>ملاحظة:</b></p>
    <p style="margin-bottom:2px;">- المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة ليست سوى المودع لديها و لا تتحمل أي مسؤولية متصلة بملكية المصنف أو محتواه أو تشوه الحاملة.</p>
    <p style="margin-bottom:2px;">- هذه الشهادة ليست ترخيصا من المؤسسة في استغلال مصنفات من التراث.</p>
    <p>-هذه الشهادة لا تحل محل خلاص المعاليم المستوجبة بعنوان حق المؤلف عن إستغلال المصنفات ولا يمكن الإستظهار بها لدى صندوق التشجيع على الإبداع الأدبي والفني أو أية جهة أخرى كترخيص بعنوان حقوق المؤلف.</p>
  </div>
</div>`;
}

function buildFrenchRenewalHTML(d: CertData): string {
  return `<div style="font-family:'Times New Roman',Georgia,serif;font-size:12px;line-height:1.7;color:#000;">
  <p style="text-align:right;margin-bottom:20px;">Tunis le ${esc(d.dateFormatted)}</p>
  <h3 style="text-align:center;font-size:17px;margin:24px 0;text-decoration:underline;font-weight:bold;">ATTESTATION DE RENOUVELLEMENT DE DÉPÔT</h3>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">  Vu la loi n° 94-36, du 24 février 1994, relative à la propriété littéraire et artistique, telle que modifiée et complétée par la loi n° 2009-33 du 23 Juin 2009,</p>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">  Vu le décret n°2013-2860 du 1er juillet 2013, relatif à la création de l'organisme tunisien des droits d'auteur et des droits voisins et fixant son organisation administrative et financière et ses modalités de fonctionnement,</p>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">  Vu le règlement intérieur de l'organisme tunisien des droits d'auteurs et des droits voisins approuvé par le ministre de la culture et de la sauvegarde du patrimoine le 6 novembre 2006 et la règlementation en vigueur,</p>
  <p style="text-align:justify;margin-bottom:14px;font-size:14px;text-indent: 1em;font-weight: bold;">Le directeur général de l'organisme tunisien des droits d'auteur et des droits voisins (OTDAV) atteste que :</p>
  <div style="margin-bottom:16px;">
    <p style="margin-bottom:5px;">- Monsieur/Madame <b>${esc(d.deposantName)}</b></p>
    <p style="margin-bottom:5px;">- a renouvelé son dépôt auprès de l'OTDAV en date du <b>${esc(d.dateFormatted)}</b></p>
    <p style="margin-bottom:5px;">- sous le numéro <b>${esc(d.certNum)}</b></p>
    <p style="margin-bottom:5px;">- l'œuvre (résumé succinct selon la déclaration du déposant): <b>${esc(d.description)}</b></p>
    <p style="margin-bottom:5px;">- Au nom du présumé auteur: <b>${esc(d.auteurs)}</b></p>
    <p style="margin-bottom:5px;">- Intitulé de l'œuvre: &quot;<b>${esc(d.title)}</b>&quot;</p>
    <p style="margin-bottom:5px;">- Sur support: <b>${esc(d.support)}</b></p>
    <p style="margin-bottom:5px;">- Durée de validité du dépôt: Du <b>${esc(d.dateFormatted)}</b> au <b>${esc(d.endDateFormatted)}</b></p>
    <p style="margin-bottom:5px;">- Date limite du renouvellement de dépôt: <b>${esc(d.endDateFormatted)}</b></p>
  </div>
  <p style="text-align:justify;margin-bottom:20px;font-style: italic;text-indent: 3em;">Cette attestation est délivrée au déposant pour servir et valoir ce que de droit.</p>
  <div style="font-size:11px;color:#333;border-top:1px solid #ccc;padding-top:10px;">
    <p style="margin-bottom:2px;"><b>NB:</b></p>
    <p style="margin-bottom:2px;">- L'OTDAV n'est que le dépositaire de l'œuvre et n'assume aucune responsabilité liée à la propriété de l'œuvre ou son contenu ou aux altérations du support.</p>
    <p>- Cette attestation ne remplace pas les redevances revendiquées au titre de droit d'auteur pour l'exploitation des œuvres et elle ne peut pas être présentée au Fonds d'encouragement à la création littéraire et artistique comme une licence de droit d'auteur.</p>
  </div>
</div>`;
}

function buildArabicRenewalHTML(d: CertData): string {
  return `<div style="font-family:'Traditional Arabic','Simplified Arabic','Geeza Pro',Arial,sans-serif;font-size:16px;line-height:1.9;color:#000;direction:rtl;text-align:right;">
  <p style="text-align:left;margin-bottom:20px;">تونس في ${esc(d.dateFormatted)}</p>
  <div id="ar-title-placeholder" style="text-align:center;font-size:20px;margin:24px 0;height:30px;"></div>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">بناء على أحكام القانون عدد 36 لسنة 1994 المتعلق بالملكية الأدبية و الفنية المؤرخ في 24 فيفري 1994 المنقح والمتمم بالقانون عدد 33 لسنة 2009 المؤرخ في 23 جوان 2009،</p>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">والأمر عدد 2860 لسنة 2013 المتعلق بإحداث المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة وضبط تنظيمها الإداري والمالي وطرق تسييرها المؤرخ في 1 جويلية 2013،</p>
  <p style="text-align:justify;margin-bottom:8px;text-indent: 1em;">والنظام الداخلي للمؤسسة التونسية لحقوق المؤلف والحقوق المجاورة المصادق عليه من قبل وزير الثقافة والمحافظة على التراث في 6 نوفمبر 2006 و التراتيب الجاري بها العمل.</p>
  <p style="text-align:justify;margin-bottom:14px;text-indent: 1em;font-weight: bold;">يشهد المدير العام للمؤسسة التونسية لحقوق المؤلف والحقوق المجاورة أنّ:</p>
  <div style="margin-bottom:16px;padding-right:10px;">
    <p style="margin-bottom:5px;">- السيّد(ة) <b>${esc(d.deposantName)}</b></p>
    <p style="margin-bottom:5px;">- جدّد إيداعه لدى المؤسسة في تاريخ <b>${esc(d.dateFormatted)}</b></p>
    <p style="margin-bottom:5px;">- تحت عدد التجديد <b>${esc(d.certNum)}</b></p>
    <p style="margin-bottom:5px;">- مصنفا يحمل عنوان: &quot;<b>${esc(d.title)}</b>&quot;</p>
    <p style="margin-bottom:5px;">- وصف مختصر لمحتوى المصنف (حسب تصريح المودع): <b>${esc(d.description)}</b></p>
    <p style="margin-bottom:5px;">- لمؤلفه المفترض: <b>${esc(d.auteurs)}</b></p>
    <p style="margin-bottom:5px;">- محمول على: <b>${esc(d.support)}</b></p>
    <p style="margin-bottom:5px;">- مدة صلوحية الإيداع: من <b>${esc(d.dateFormatted)}</b> إلى <b>${esc(d.endDateFormatted)}</b></p>
    <p style="margin-bottom:5px;">- آخر آجال تجديد إيداع المصنف: <b>${esc(d.endDateFormatted)}</b></p>
  </div>
  <p style="text-align:justify;margin-bottom:20px;text-indent: 3em;">سلمت هذه الشهادة للمودع(ة) لما عساه أن يكون صالحا قانونا.</p>
  <div style="font-size:13px;color:#333;border-top:1px solid #ccc;padding-top:10px;">
    <p style="margin-bottom:2px;"><b>ملاحظة:</b></p>
    <p style="margin-bottom:2px;">- المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة ليست سوى المودع لديها و لا تتحمل أي مسؤولية متصلة بملكية المصنف أو محتواه أو تشوه الحاملة.</p>
    <p style="margin-bottom:2px;">- هذه الشهادة ليست ترخيصا من المؤسسة في استغلال مصنفات من التراث.</p>
    <p>-هذه الشهادة لا تحل محل خلاص المعاليم المستوجبة بعنوان حق المؤلف عن إستغلال المصنفات ولا يمكن الإستظهار بها لدى صندوق التشجيع على الإبداع الأدبي والفني أو أية جهة أخرى كترخيص بعنوان حقوق المؤلف.</p>
  </div>
</div>`;
}

const FacturePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get("type");
  const isRenewal = type === "renouvellement";
  const [depot, setDepot] = useState<Depot | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetch(`http://localhost:5000/depots/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDepot(data))
      .catch(() => {});
  }, [id, navigate]);

  const handleSubmit = async () => {
    setError("");
    if (!invoiceNumber.trim()) {
      setError("Veuillez saisir le numéro de facture");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/depots/${id}/payer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ numeroRecuPaiement: invoiceNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du paiement");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const generateCertificate = async () => {
    if (!depot) return;

    const d = new Date(depot.dateDepot);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const dateFormatted = `${dd}/${mm}/${yyyy}`;

    const endDate = new Date(d);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const endDateFormatted = `${String(endDate.getDate()).padStart(2, "0")}/${String(endDate.getMonth() + 1).padStart(2, "0")}/${endDate.getFullYear()}`;

    const certNum = `${depot.numeroSequentiel ?? depot.id}-${depot.oeuvre.categorie.code}-${dd}-${mm}-${yyyy}`;
    const isFrench = !!depot.deposant.nomComplet_fr;

    const data: CertData = {
      dateFormatted,
      endDateFormatted,
      certNum,
      deposantName: isFrench
        ? (depot.deposant.nomComplet_fr || depot.deposant.raisonSociale || "")
        : (depot.deposant.nomComplet_ar || depot.deposant.raisonSociale || ""),
      title: isFrench
        ? (depot.oeuvre.titre_fr || depot.oeuvre.titre_ar || "")
        : (depot.oeuvre.titre_ar || depot.oeuvre.titre_fr || ""),
      description: isFrench
        ? (depot.oeuvre.description_fr || "")
        : (depot.oeuvre.description_ar || ""),
      auteurs: depot.auteurs
        .map((a) =>
          isFrench
            ? a.auteur.nomComplet_fr || a.auteur.nomComplet_ar
            : a.auteur.nomComplet_ar || a.auteur.nomComplet_fr
        )
        .filter(Boolean)
        .join(" / "),
      support: isFrench
        ? (depot.oeuvre.typeSupport_fr || "")
        : (depot.oeuvre.typeSupport_ar || ""),
    };

    const htmlContent = isFrench ? buildFrenchHTML(data) : buildArabicHTML(data);

    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.padding = "60px";
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

      // For Arabic certificate, overlay the title using canvas 2D (proper shaping)
      if (!isFrench) {
        const placeholder = container.querySelector("#ar-title-placeholder");
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
          ctx.font = "bold 28px 'Traditional Arabic','Simplified Arabic',Arial,sans-serif";
          ctx.direction = "rtl";
          ctx.textAlign = "center";
          ctx.fillStyle = "#000000";
          ctx.fillText("شـهــادة إيـــــــداع", 400, 40);

          // Underline
          const textWidth = ctx.measureText("شـهــادة إيـــــــداع").width;
          ctx.beginPath();
          ctx.moveTo(400 - textWidth / 2, 46);
          ctx.lineTo(400 + textWidth / 2, 46);
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const titleImg = titleCanvas.toDataURL("image/png");
          const titleWidthMm = imgWidth * 0.6;
          const titleHeightMm = (60 / 800) * titleWidthMm;
          const titleX = (imgWidth - titleWidthMm) / 2;
          doc.addImage(titleImg, "PNG", titleX, yMm, titleWidthMm, titleHeightMm);
        }
      }

      doc.save(
        `certificat-${depot.numeroSequentiel ?? depot.id}-${depot.oeuvre.categorie.code}-${dd}-${mm}-${yyyy}.pdf`
      );
    } finally {
      document.body.removeChild(container);
    }
  };

  const generateRenewalCertificate = async () => {
    if (!depot) return;

    const renewalDate = depot.dateRenouvellement ? new Date(depot.dateRenouvellement) : new Date();
    const dd = String(renewalDate.getDate()).padStart(2, "0");
    const mm = String(renewalDate.getMonth() + 1).padStart(2, "0");
    const yyyy = renewalDate.getFullYear();
    const dateFormatted = `${dd}/${mm}/${yyyy}`;

    const endDate = new Date(renewalDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const endDateFormatted = `${String(endDate.getDate()).padStart(2, "0")}/${String(endDate.getMonth() + 1).padStart(2, "0")}/${endDate.getFullYear()}`;

    const depotDate = new Date(depot.dateDepot);
    const ddd = String(depotDate.getDate()).padStart(2, "0");
    const dmm = String(depotDate.getMonth() + 1).padStart(2, "0");
    const dyyyy = depotDate.getFullYear();
    const certNum = `${depot.numeroSequentiel ?? depot.id}-${depot.oeuvre.categorie.code}-${ddd}-${dmm}-${dyyyy}`;
    const isFrench = !!depot.deposant.nomComplet_fr;

    const data: CertData = {
      dateFormatted,
      endDateFormatted,
      certNum,
      deposantName: isFrench
        ? (depot.deposant.nomComplet_fr || depot.deposant.raisonSociale || "")
        : (depot.deposant.nomComplet_ar || depot.deposant.raisonSociale || ""),
      title: isFrench
        ? (depot.oeuvre.titre_fr || depot.oeuvre.titre_ar || "")
        : (depot.oeuvre.titre_ar || depot.oeuvre.titre_fr || ""),
      description: isFrench
        ? (depot.oeuvre.description_fr || "")
        : (depot.oeuvre.description_ar || ""),
      auteurs: depot.auteurs
        .map((a) =>
          isFrench
            ? a.auteur.nomComplet_fr || a.auteur.nomComplet_ar
            : a.auteur.nomComplet_ar || a.auteur.nomComplet_fr
        )
        .filter(Boolean)
        .join(" / "),
      support: isFrench
        ? (depot.oeuvre.typeSupport_fr || "")
        : (depot.oeuvre.typeSupport_ar || ""),
    };

    const htmlContent = isFrench ? buildFrenchRenewalHTML(data) : buildArabicRenewalHTML(data);

    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.padding = "60px";
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

      if (!isFrench) {
        const placeholder = container.querySelector("#ar-title-placeholder");
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
          ctx.font = "bold 28px 'Traditional Arabic','Simplified Arabic',Arial,sans-serif";
          ctx.direction = "rtl";
          ctx.textAlign = "center";
          ctx.fillStyle = "#000000";
          ctx.fillText("شهادة تجديد الإيداع", 400, 40);

          const textWidth = ctx.measureText("شهادة تجديد الإيداع").width;
          ctx.beginPath();
          ctx.moveTo(400 - textWidth / 2, 46);
          ctx.lineTo(400 + textWidth / 2, 46);
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const titleImg = titleCanvas.toDataURL("image/png");
          const titleWidthMm = imgWidth * 0.6;
          const titleHeightMm = (60 / 800) * titleWidthMm;
          const titleX = (imgWidth - titleWidthMm) / 2;
          doc.addImage(titleImg, "PNG", titleX, yMm, titleWidthMm, titleHeightMm);
        }
      }

      doc.save(
        `certificat-renouvellement-${depot.numeroSequentiel ?? depot.id}-${depot.oeuvre.categorie.code}-${ddd}-${dmm}-${dyyyy}.pdf`
      );
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative">
      <button
        onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); }}
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
        </svg>
        Déconnexion
      </button>
      <div className="paper-form w-full max-w-lg p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/logo.png"
              alt="OTDAV"
              className="h-14 w-14 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-2xl font-bold text-primary tracking-tight">
              OTDAV
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground text-center">
            {isRenewal
              ? "Renouvellement de dépôt / تجديد الإيداع"
              : "Paiement du dépôt / دفع مبلغ الإيداع"}
          </h1>
          {depot && (
            <div className="mt-4 w-full space-y-1 text-sm text-muted-foreground">
              <p>
                Numéro de dépôt:{" "}
                <span className="font-semibold text-foreground">
                  {depot.numeroSequentiel ?? depot.id}-{depot.oeuvre.categorie.code}-
                  {new Date(depot.dateDepot)
                    .toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    .replace(/\//g, "-")}
                </span>
              </p>
              <p>
                Déposant:{" "}
                <span className="font-semibold text-foreground">
                  {depot.deposant.nomComplet_fr ||
                    depot.deposant.nomComplet_ar ||
                    depot.deposant.raisonSociale}
                </span>
              </p>
              <p>
                Oeuvre:{" "}
                <span className="font-semibold text-foreground">
                  {depot.oeuvre.titre_fr || depot.oeuvre.titre_ar}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Invoice input */}
        {!success && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Numéro de facture / رقم الفاتورة
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Saisir le numéro de facture..."
              className="input-field text-lg py-3 text-center tracking-wider"
              autoFocus
              disabled={loading}
            />
            {error && (
              <p className="text-destructive text-sm font-medium text-center">
                {error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {loading ? "Envoi en cours..." : "Valider"}
            </button>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="space-y-6 text-center">
            <p className="text-green-600 font-semibold text-base">
              {isRenewal
                ? "Renouvellement enregistré avec succès"
                : "Paiement enregistré avec succès"}
            </p>
            <button
              onClick={isRenewal ? generateRenewalCertificate : generateCertificate}
              className="w-full py-4 text-lg font-bold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              style={{ backgroundColor: "hsl(215, 60%, 22%)" }}
            >
              {isRenewal
                ? "🖨️ Imprimer le certificat de renouvellement"
                : "🖨️ Imprimer le certificat"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacturePage;
