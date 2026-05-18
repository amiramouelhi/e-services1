import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import otdavLogo from "../../assets/otdav-logo.png";
import OtdavSidebar from "../../components/OtdavSidebar";
import { useAuthLang } from "../../hooks/useAuthLang";

const T = {
  ar: {
    title: "نسيت كلمة المرور؟",
    subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رمزاً لإعادة تعيين كلمة المرور.",
    email: "البريد الإلكتروني",
    placeholderEmail: "أدخل بريدك الإلكتروني",
    submit: "إرسال الرمز",
    submitting: "...جارٍ الإرسال",
    backToLogin: "العودة إلى تسجيل الدخول",
    genericError: "فشل الإرسال",
    unknownError: "خطأ غير معروف",
  },
  fr: {
    title: "Mot de passe oublié ?",
    subtitle: "Entrez votre adresse e-mail et nous vous enverrons un code pour réinitialiser votre mot de passe.",
    email: "Adresse e-mail",
    placeholderEmail: "Saisir votre adresse e-mail",
    submit: "Envoyer le code",
    submitting: "Envoi en cours...",
    backToLogin: "Retour à la connexion",
    genericError: "Échec de l'envoi",
    unknownError: "Erreur inconnue",
  },
};

const ForgotPasswordPage = () => {
  const [lang, setLang] = useAuthLang();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const t = T[lang];
  const isRtl = lang === "ar";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.genericError);
      navigate("/reset-password", { state: { email: email.trim().toLowerCase() } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.unknownError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <OtdavSidebar />

      <div className="w-full md:w-1/2 flex items-center justify-center bg-background px-6 relative">
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
          <div className="md:hidden text-center mb-10">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-20 h-auto mx-auto mb-3" />
            <h1 className="text-xl font-bold text-foreground">OTDAV Connect</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{t.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder={t.placeholderEmail}
                required
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
            <Link to="/" className="text-primary font-medium hover:underline">
              {t.backToLogin}
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

export default ForgotPasswordPage;
