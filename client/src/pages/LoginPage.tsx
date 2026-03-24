import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { success?: string } | null)?.success;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de la connexion");
      }
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
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

        <div className="absolute top-8 left-0 right-0 z-10 text-center px-8">
          <p className="text-white font-medium mb-1" style={{ fontSize: "16px" }}>
            المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة
          </p>
          <p className="text-white/60" style={{ fontSize: "13px" }}>
            Organisme Tunisien des Droits d'Auteur et des Droits Voisins
          </p>
        </div>

        <div className="relative z-10 text-center px-8">
          <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-28 h-auto mx-auto" />
          </div>
          <div className="w-12 h-0.5 bg-white/30 mx-auto my-4" />
          <h1 className="text-3xl font-bold text-white tracking-tight">OTDAV Connect</h1>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-10">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-20 h-auto mx-auto mb-3" />
            <h1 className="text-xl font-bold text-foreground">OTDAV Connect</h1>
            <p className="text-sm text-muted-foreground">OTDAV</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Connexion / تسجيل الدخول
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Accédez à votre espace de dépôt
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {successMessage && (
              <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Adresse e-mail / البريد الإلكتروني
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="input-field"
                placeholder="Saisir votre identifiant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mot de passe / كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Saisir votre mot de passe"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Connexion en cours..." : "Se connecter / دخول"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Pas encore de compte ? S'inscrire / ليس لديك حساب؟{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              سجل الآن
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

export default LoginPage;
