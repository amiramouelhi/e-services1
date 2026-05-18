import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import otdavLogo from "../../assets/otdav-logo.png";
import OtdavSidebar from "../../components/OtdavSidebar";
import { useAuthLang } from "../../hooks/useAuthLang";

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
    forgotPassword: "نسيت كلمة المرور؟",
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
    forgotPassword: "Mot de passe oublié ?",
  },
};

const LoginPage = () => {
  const [lang, setLang] = useAuthLang();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      console.log(import.meta.env.VITE_API_URL);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // console.log("Login error:", data);
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
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder={t.placeholderPassword}
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline">
                {t.forgotPassword}
              </Link>
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
