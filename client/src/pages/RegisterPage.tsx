import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de l'inscription");
      }
      navigate("/", { state: { success: "Compte créé avec succès" } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding Panel */}
      <div
        className="hidden md:flex w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "hsl(215 60% 22%)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: "hsl(215 60% 60%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "hsl(215 60% 70%)" }}
        />

        <div className="relative z-10 text-center px-8">
          <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-28 h-auto mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">App-Depot</h1>
          <div className="w-12 h-0.5 bg-white/30 mx-auto my-4" />
          <p className="text-base text-white/70 max-w-xs mx-auto leading-relaxed">
            Organisme Tunisien des Droits d'Auteur et des Droits Voisins
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-10">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-20 h-auto mx-auto mb-3" />
            <h1 className="text-xl font-bold text-foreground">App-Depot</h1>
            <p className="text-sm text-muted-foreground">OTDAV</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Inscription
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Créez votre compte OTDAV
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Saisir votre adresse e-mail"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Saisir votre mot de passe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirmer votre mot de passe"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Vous avez déjà un compte ?{" "}
            <Link to="/" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>

          <p className="text-xs text-muted-foreground text-center mt-6">
            OTDAV &mdash; Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
