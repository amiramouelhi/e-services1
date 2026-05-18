import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx-js-style";

interface OrganisateurRow {
  nom: string;
  mf: string;
  adresse: string;
  telephone: string;
}

const COLUMNS = ["Nom", "MF", "Adresse", "Téléphone"] as const;

const getToken = () => localStorage.getItem("adminToken");

const OrganisateursPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewData, setPreviewData] = useState<OrganisateurRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const parseFile = (file: File) => {
    setMessage(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
      setPreviewData(
        rows.map((r) => ({
          nom: r["Nom"] || r["nom"] || "",
          mf: r["MF"] || r["mf"] || "",
          adresse: r["Adresse"] || r["adresse"] || "",
          telephone: r["Téléphone"] || r["Telephone"] || r["telephone"] || r["téléphone"] || "",
        }))
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([["Nom", "MF", "Adresse", "Téléphone"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Organisateurs");
    XLSX.writeFile(wb, "modele_organisateurs.xlsx");
  };

  const handleImport = async () => {
    const valid = previewData.filter((r) => r.nom.trim());
    if (!valid.length) {
      setMessage({ type: "error", text: "Aucun organisateur valide (colonne Nom requise)" });
      return;
    }

    setImporting(true);
    setMessage(null);
    try {
      const token = getToken();
      if (!token) { navigate("/"); return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/autorisations/organisateurs/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organisateurs: valid.map((r) => ({
            nom: r.nom,
            mf: r.mf || null,
            adresse: r.adresse || null,
            telephone: r.telephone || null,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || `${data.count} organisateurs importés avec succès` });
        setPreviewData([]);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de l'import" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
          Import des organisateurs / استيراد المتعهدين
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          Uploadez un fichier Excel contenant la liste des organisateurs
        </p>
      </div>

      {/* Upload zone */}
      <div className="paper-form p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
            Fichier Excel
          </h3>
          <button
            onClick={downloadTemplate}
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--muted-foreground))",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(var(--muted) / 0.5)";
              e.currentTarget.style.color = "hsl(var(--foreground))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "hsl(var(--muted-foreground))";
            }}
          >
            Télécharger le modèle Excel
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg p-8 text-center cursor-pointer transition-colors"
          style={{
            border: `2px dashed ${dragOver ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`,
            background: dragOver ? "hsl(var(--primary) / 0.04)" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!dragOver) {
              e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.3)";
              e.currentTarget.style.background = "hsl(var(--muted) / 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (!dragOver) {
              e.currentTarget.style.borderColor = "hsl(var(--border))";
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Glissez-déposez votre fichier ici ou{" "}
            <span style={{ color: "hsl(var(--foreground))", fontWeight: 500, textDecoration: "underline" }}>parcourir</span>
          </p>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>.xlsx, .xls uniquement</p>
          {fileName && (
            <p className="mt-3 text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{fileName}</p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Message */}
      {message && (
        <div
          className="px-4 py-3 rounded-lg text-sm mb-6"
          style={
            message.type === "success"
              ? { background: "hsl(142 76% 96%)", border: "1px solid hsl(142 71% 70%)", color: "hsl(142 71% 29%)" }
              : { background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)", color: "hsl(var(--destructive))" }
          }
        >
          {message.text}
        </div>
      )}

      {/* Preview table */}
      {previewData.length > 0 && (
        <div className="paper-form overflow-hidden">
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ background: "hsl(var(--surface-muted))" }}
          >
            <span className="text-sm font-semibold" style={{ color: "hsl(215 60% 22%)" }}>
              {previewData.length} organisateur{previewData.length > 1 ? "s" : ""} trouvé{previewData.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn-primary"
              style={{ padding: "0.375rem 1rem", fontSize: "0.8125rem" }}
            >
              {importing ? "Import en cours..." : "Confirmer l'import"}
            </button>
          </div>
          <div className="overflow-x-auto" style={{ maxHeight: "420px", overflowY: "auto" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "hsl(var(--surface-muted))" }}>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))", width: "50px" }}>#</th>
                  {COLUMNS.map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr
                    key={i}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid hsl(var(--border))" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "hsl(var(--muted) / 0.3)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-4" style={{ color: "hsl(var(--muted-foreground))" }}>{i + 1}</td>
                    <td className="px-5 py-4 font-medium" style={{ color: "hsl(var(--foreground))" }}>{row.nom || "—"}</td>
                    <td className="px-5 py-4" style={{ color: "hsl(var(--muted-foreground))" }}>{row.mf || "—"}</td>
                    <td className="px-5 py-4" style={{ color: "hsl(var(--muted-foreground))" }}>{row.adresse || "—"}</td>
                    <td className="px-5 py-4" style={{ color: "hsl(var(--muted-foreground))" }}>{row.telephone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganisateursPage;
