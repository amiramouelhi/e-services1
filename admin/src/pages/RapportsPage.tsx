import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx-js-style";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ReportRow {
  code: number;
  categorie: string;
  [key: string]: number | string;
}

interface ReportData {
  year: number;
  months: string[];
  report: ReportRow[];
}

const SHORT_MONTHS = [
  "Jan", "Fev", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aou", "Sep", "Oct", "Nov", "Dec",
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

const getToken = () => localStorage.getItem("adminToken");

const getCount = (row: ReportRow, monthIdx: number): number =>
  (row[`count_${monthIdx}`] as number) || 0;

const getAmount = (row: ReportRow, monthIdx: number): number =>
  (row[`amount_${monthIdx}`] as number) || 0;

const tooltipStyle = {
  background: "white",
  border: "1px solid hsl(215 20% 88%)",
  borderRadius: "8px",
  fontSize: "13px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const RapportsPage = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async (y: number) => {
    const token = getToken();
    if (!token) { navigate("/"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/admin/rapports/yearly?year=${y}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement du rapport");
      const json: ReportData = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchReport(year); }, [year, fetchReport]);

  // Build 16 category rows
  const rows: ReportRow[] = [];
  for (let i = 1; i <= 16; i++) {
    const found = data?.report.find((r) => r.code === i);
    rows.push(found || { code: i, categorie: `صنف ${i}` });
  }

  // Totals per month
  const totals = Array.from({ length: 12 }, (_, m) => ({
    count: rows.reduce((s, r) => s + getCount(r, m), 0),
    amount: rows.reduce((s, r) => s + getAmount(r, m), 0),
  }));

  // Grand totals
  const grandTotalCount = totals.reduce((s, t) => s + t.count, 0);
  const grandTotalAmount = grandTotalCount * 30;

  // Chart 1 & 2 data — depots and amounts per month
  const monthlyChartData = SHORT_MONTHS.map((name, i) => ({
    name,
    depots: totals[i].count,
    montant: totals[i].count * 30,
  }));

  // Chart 3 data — depots per category (only those with > 0)
  const categoryChartData = rows
    .map((r) => {
      const total = Array.from({ length: 12 }, (_, m) => getCount(r, m)).reduce((a, b) => a + b, 0);
      return { name: r.categorie, depots: total };
    })
    .filter((c) => c.depots > 0);

  // Excel export
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData: (string | number)[][] = [];

    const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    wsData.push(["إيداع سنة " + year, ...Array(24).fill("")]);
    wsData.push(["الصنف", ...months.flatMap((m) => [m, ""])]);
    wsData.push(["", ...months.flatMap(() => ["العدد", "المبلغ"])]);

    rows.forEach((row) => {
      wsData.push([
        row.categorie,
        ...Array.from({ length: 12 }, (_, i) => [getCount(row, i), getAmount(row, i)]).flat(),
      ]);
    });

    wsData.push([
      "المجموع",
      ...Array.from({ length: 12 }, (_, i) => [totals[i].count, totals[i].amount]).flat(),
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 24 } },
      ...months.map((_, i) => ({ s: { r: 1, c: 1 + i * 2 }, e: { r: 1, c: 2 + i * 2 } })),
    ];

    ws["!cols"] = [{ wch: 14 }, ...Array(24).fill({ wch: 10 })];
    ws["!rows"] = [
      { hpt: 30 },
      { hpt: 25 },
      { hpt: 20 },
      ...Array(16).fill({ hpt: 18 }),
      { hpt: 35 },
    ];
    ws["!dir"] = "rtl";
    wb.Workbook = { Views: [{ RTL: true }] };

    const totalRows = wsData.length;
    const totalCols = 25;

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) ws[cellRef] = { v: "", t: "s" };

        const isHeaderRow = r === 0 || r === 1 || r === 2;
        const isTotalRow = r === totalRows - 1;
        const isEvenRow = r % 2 === 0;

        if (isHeaderRow || isTotalRow) {
          ws[cellRef].s = {
            fill: { fgColor: { rgb: "1a3c6e" } },
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: r === 0 ? 14 : 11 },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top:    { style: "thin", color: { rgb: "FFFFFF" } },
              bottom: { style: "thin", color: { rgb: "FFFFFF" } },
              left:   { style: "thin", color: { rgb: "FFFFFF" } },
              right:  { style: "thin", color: { rgb: "FFFFFF" } },
            }
          };
        } else {
          ws[cellRef].s = {
            fill: { fgColor: { rgb: isEvenRow ? "f0f4f8" : "FFFFFF" } },
            font: { sz: 11, color: { rgb: "1a3c6e" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top:    { style: "thin", color: { rgb: "d0d7e3" } },
              bottom: { style: "thin", color: { rgb: "d0d7e3" } },
              left:   { style: "thin", color: { rgb: "d0d7e3" } },
              right:  { style: "thin", color: { rgb: "d0d7e3" } },
            }
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Rapport " + year);
    XLSX.writeFile(wb, "rapport-depot-" + year + ".xlsx");
  };

  const hasData = data && data.report.length > 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
            Rapports / التقارير
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Rapport annuel des depots
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="input-field w-auto pr-8"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {!loading && hasData && (
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ background: "#1a3c6e" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#15305a"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#1a3c6e"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exporter Excel
            </button>
          )}
        </div>
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

      {/* Empty */}
      {!loading && !error && !hasData && (
        <div className="paper-form p-16 text-center">
          <svg className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
            Aucune donnee pour l'annee {year}
          </p>
        </div>
      )}

      {/* Main content */}
      {!loading && !error && hasData && (
        <>
          {/* ===== STAT CARDS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="paper-form p-5 flex items-center gap-4" style={{ borderLeft: "4px solid #1a3c6e" }}>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(26,60,110,0.1)" }}
              >
                <svg className="w-6 h-6" style={{ color: "#1a3c6e" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{grandTotalCount}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Total depots {year}</p>
              </div>
            </div>
            <div className="paper-form p-5 flex items-center gap-4" style={{ borderLeft: "4px solid #10b981" }}>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <svg className="w-6 h-6" style={{ color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{grandTotalAmount.toLocaleString()} DT</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Montant total (DT)</p>
              </div>
            </div>
          </div>

          {/* ===== CHARTS ROW 1 — side by side ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Chart 1 — Depots per month */}
            <div className="paper-form overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                  Nombre de depots par mois
                </h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 88%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 15% 50%)" }} tickLine={false} axisLine={{ stroke: "hsl(215 20% 88%)" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(215 15% 50%)" }} tickLine={false} axisLine={{ stroke: "hsl(215 20% 88%)" }} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600, color: "#1a3c6e" }} formatter={(value) => [value, "Depots"]} />
                    <Bar dataKey="depots" fill="#1a3c6e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2 — Amount per month */}
            <div className="paper-form overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                  Montant total par mois (DT)
                </h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 88%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 15% 50%)" }} tickLine={false} axisLine={{ stroke: "hsl(215 20% 88%)" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(215 15% 50%)" }} tickLine={false} axisLine={{ stroke: "hsl(215 20% 88%)" }} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600, color: "#10b981" }} formatter={(value) => [`${value} DT`, "Montant"]} />
                    <Bar dataKey="montant" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ===== CHART 3 — Horizontal bar by category ===== */}
          {categoryChartData.length > 0 && (
            <div className="paper-form overflow-hidden mb-6">
              <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                  Depots par categorie (annee complete)
                </h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={Math.max(280, categoryChartData.length * 36)}>
                  <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 88%)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(215 15% 50%)" }} tickLine={false} axisLine={{ stroke: "hsl(215 20% 88%)" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(215 15% 50%)" }} tickLine={false} axisLine={{ stroke: "hsl(215 20% 88%)" }} width={60} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600, color: "#3b82f6" }} formatter={(value) => [value, "Depots"]} />
                    <Bar dataKey="depots" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default RapportsPage;
