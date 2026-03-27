import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";
import OtdavSidebar from "../components/OtdavSidebar";

type Lang = "ar" | "fr";

const T = {
  ar: {
    title: "تسجيل الدخول",
    subtitle: "الدخول إلى فضاء الإيداع الخاص بك",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "دخول",
    submitting: "...جارٍ الدخول",
    registerLink: "ليس لديك حساب؟ ",
    registerAction: "سجل الآن",
    genericError: "فشل تسجيل الدخول",
    unknownError: "خطأ غير معروف",
    placeholderEmail: "أدخل بريدك الإلكتروني",
    placeholderPassword: "أدخل كلمة المرور",
  },
  fr: {
    title: "Connexion",
    subtitle: "Accédez à votre espace de dépôt",
    email: "Adresse e-mail",
    password: "Mot de passe",
    submit: "Se connecter",
    submitting: "Connexion en cours...",
    registerLink: "Pas encore de compte ? ",
    registerAction: "S'inscrire",
    genericError: "Échec de la connexion",
    unknownError: "Erreur inconnue",
    placeholderEmail: "Saisir votre identifiant",
    placeholderPassword: "Saisir votre mot de passe",
  },
};

const LoginPage = () => {
  const [lang, setLang] = useState<Lang>("ar");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { success?: string } | null)?.success;

  const t = T[lang];
  const isRtl = lang === "ar";

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
        throw new Error(data.error || t.genericError);
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.unknownError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <OtdavSidebar />

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-background px-6 relative">
        {/* Language toggle — fixed top right */}
        <div
          className="absolute top-4 right-4 z-10 flex items-center rounded-full p-0.5"
          style={{ background: "hsl(215 25% 90%)" }}
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
            Francais
          </button>
        </div>

        <div className="w-full max-w-sm" dir={isRtl ? "rtl" : "ltr"}>
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-10">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-20 h-auto mx-auto mb-3" />
            <h1 className="text-xl font-bold text-foreground">OTDAV Connect</h1>
            <p className="text-sm text-muted-foreground">OTDAV</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {t.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {t.subtitle}
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
                {t.email}
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="input-field"
                placeholder={t.placeholderEmail}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder={t.placeholderPassword}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? t.submitting : t.submit}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {t.registerLink}
            <Link to="/register" className="text-primary font-medium hover:underline">
              {t.registerAction}
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
