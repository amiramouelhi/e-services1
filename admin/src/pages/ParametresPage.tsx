import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ParametresPage = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/"); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/admin/parametres/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la modification");
      setSuccess("Mot de passe modifie avec succes");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
          Parametres / الإعدادات
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          Configuration du systeme
        </p>
      </div>

      {/* Change password section */}
      <div className="paper-form max-w-lg">
        <div className="px-6 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(var(--primary) / 0.1)" }}
            >
              <svg className="w-4.5 h-4.5" style={{ color: "hsl(var(--primary))" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Changer le mot de passe
              </h3>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Modifiez votre mot de passe administrateur
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{
                background: "hsl(var(--destructive) / 0.1)",
                border: "1px solid hsl(var(--destructive) / 0.3)",
                color: "hsl(var(--destructive))",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{
                background: "hsl(142 71% 45% / 0.1)",
                border: "1px solid hsl(142 71% 45% / 0.3)",
                color: "hsl(142 71% 45%)",
              }}
            >
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
              placeholder="Saisir le mot de passe actuel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="Minimum 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirmer le nouveau mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm mt-2"
          >
            {loading ? "En cours..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParametresPage;
