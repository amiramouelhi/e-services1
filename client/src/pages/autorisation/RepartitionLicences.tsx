import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Lang = "ar" | "fr";

const ROWS: { ar: string; fr: string }[] = [
  { ar: "عروض فرجة",                                          fr: "Cirque" },
  { ar: "المسرحيات",                                      fr: "Théâtres" },
  { ar: "المسرح الغنائي",                                 fr: "Théâtre lyrique" },
  { ar: "الحفلات الموسيقية",                              fr: "Concerts musicaux" },
  { ar: "الحفلات الراقصة بواسطة المسجلات",               fr: "Bals enregistrés" },
  { ar: "الحفلات الراقصة بواسطة الفرق",                  fr: "Bals par groupes" },
  { ar: "القطع الموسيقية المصاحبة للأشرطة",              fr: "Musique accompagnatrice" },
  { ar: "القطع الموسيقية المذاعة في الفواصل",            fr: "Pièces musicales diffusées dans les intervalles" },
];

const T = {
  ar: {
    title: "توزيع التراخيص",
    back: "رجوع",
    colType: "نوع العرض",
    colNombre: "العدد",
    colMontant: "المبلغ (د.ت)",
    total: "المجموع",
    labelQualite: "صفة طالب الترخيص",
    placeholderQualite: "اختر الصفة",
    labelEspace: "حسب الفضاء",
    placeholderEspace: "اختر الفضاء",
    chartTitle: "توزيع التراخيص حسب النوع",
      qualites: [
    { value: "traiteur_evenementiel", label: "متعهد حفلات" },
    { value: "espace_touristique", label: "فضاء سياحي" },
    { value: "salle_fetes", label: "قاعة أفراح" },
    { value: "salle_sport", label: "قاعة رياضة" },
    { value: "cafes_restaurants", label: "مقاهي + مطاعم" },
    { value: "transport", label: "وسائل نقل" },
    { value: "structure_publique", label: "هيكل عمومي" },
  ]
  },
  fr: {
    title: "Répartition des licences",
    back: "Retour",
    colType: "Type de spectacle",
    colNombre: "Nombre",
    colMontant: "Montant (DT)",
    total: "Total",
    labelQualite: "Qualité du demandeur",
    placeholderQualite: "Choisir la qualité",
    labelEspace: "Par espace",
    placeholderEspace: "Choisir l'espace",
    chartTitle: "Répartition des licences par type",
      qualites: [
    { value: "traiteur_evenementiel", label: "Traiteur événementiel" },
    { value: "espace_touristique", label: "Espace touristique" },
    { value: "salle_fetes", label: "Salle des fêtes" },
    { value: "salle_sport", label: "Salle de sport" },
    { value: "cafes_restaurants", label: "Cafés & Restaurants" },
    { value: "transport", label: "Moyens de transport" },
    { value: "structure_publique", label: "Structure publique" },
  ],
  },
};

const CHART_DATA = ROWS.map((row) => ({ ar: row.ar, fr: row.fr, nombre: 0 }));

const RepartitionLicencesPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("ar");
  const [qualite, setQualite] = useState("");
  const [espace, setEspace] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  const t = T[lang];
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div
        className="flex-shrink-0 border-b border-border/60"
        style={{ background: "hsl(215 60% 22%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/statistiques")}
            className="flex items-center gap-2 text-white/70 font-semibold hover:text-white transition-colors"
            style={{ fontSize: "14px" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t.back}
          </button>
          <h1 className="text-white font-semibold tracking-tight" style={{ fontSize: "15px" }}>
            {t.title}
          </h1>
          {/* Language toggle */}
          <div
            className="flex items-center rounded-full p-0.5"
            style={{ background: "hsl(215 40% 35%)" }}
          >
            <button
              onClick={() => setLang("ar")}
              className="relative px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200"
              style={
                lang === "ar"
                  ? { background: "white", color: "hsl(215 60% 22%)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }
                  : { background: "transparent", color: "rgba(255,255,255,0.6)" }
              }
            >
              عربي
            </button>
            <button
              onClick={() => setLang("fr")}
              className="relative px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200"
              style={
                lang === "fr"
                  ? { background: "white", color: "hsl(215 60% 22%)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }
                  : { background: "transparent", color: "rgba(255,255,255,0.6)" }
              }
            >
              Français
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="paper-form overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "14px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "hsl(215 60% 22%)", color: "white" }}>
                  <th
                    className="px-5 py-3 font-semibold text-right"
                    style={{ width: "60%", borderBottom: "2px solid hsl(215 50% 15%)" }}
                  >
                    {t.colType}
                  </th>
                  <th
                    className="px-5 py-3 font-semibold text-center"
                    style={{ width: "20%", borderBottom: "2px solid hsl(215 50% 15%)" }}
                  >
                    {t.colNombre}
                  </th>
                  <th
                    className="px-5 py-3 font-semibold text-center"
                    style={{ width: "20%", borderBottom: "2px solid hsl(215 50% 15%)" }}
                  >
                    {t.colMontant}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={i}
                    style={{ background: i % 2 === 0 ? "white" : "hsl(215 30% 97%)" }}
                  >
                    <td
                      className="px-5 py-3 text-foreground"
                      style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}
                    >
                      {lang === "ar" ? row.ar : row.fr}
                    </td>
                    <td
                      className="px-5 py-3 text-center text-muted-foreground"
                      style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}
                    >
                      0
                    </td>
                    <td
                      className="px-5 py-3 text-center text-muted-foreground"
                      style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}
                    >
                      0
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr style={{ background: "hsl(215 60% 22%)", color: "white" }}>
                  <td className="px-5 py-3 font-bold">{t.total}</td>
                  <td className="px-5 py-3 font-bold text-center">0</td>
                  <td className="px-5 py-3 font-bold text-center">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter section */}
        <div className="paper-form mt-4 px-6 py-4">
          <div className="flex flex-wrap gap-6">
            {/* Qualité */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="font-medium text-foreground" style={{ fontSize: "13px" }}>
                {t.labelQualite}
              </label>
              <select
                value={qualite}
                onChange={(e) => setQualite(e.target.value)}
                className="input-field w-full"
                style={{ fontSize: "14px" }}
              >
                <option value="">{t.placeholderQualite}</option>
{t.qualites?.map((q) => (
  <option key={q.value} value={q.value}>
    {q.label}
  </option>
))}
              </select>
            </div>

            {/* Espace */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="font-medium text-foreground" style={{ fontSize: "13px" }}>
                {t.labelEspace}
              </label>
              <select
                value={espace}
                onChange={(e) => setEspace(e.target.value)}
                className="input-field w-full"
                style={{ fontSize: "14px" }}
              >
                <option value="">{t.placeholderEspace}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart section */}
        <div className="paper-form mt-4 px-6 py-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontSize: "15px" }}>
            {t.chartTitle}
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={CHART_DATA.map((d) => ({ name: lang === "ar" ? d.ar : d.fr, nombre: d.nombre }))}
              margin={{ top: 8, right: 16, left: 0, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 90%)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(215 15% 40%)" }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(215 15% 40%)" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ fontSize: "13px", borderRadius: "6px", border: "1px solid hsl(215 20% 85%)" }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="nombre" name={t.colNombre} fill="#1a3c6e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default RepartitionLicencesPage;
