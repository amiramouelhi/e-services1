import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";
import OtdavSidebar from "../components/OtdavSidebar";

type Lang = "ar" | "fr";

const T = {
  ar: {
    title: "إنشاء حساب جديد",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    submit: "إنشاء حساب",
    submitting: "...جارٍ الإنشاء",
    loginLink: "لديك حساب بالفعل؟ ",
    loginAction: "تسجيل الدخول",
    fullNameRequired: "الاسم الكامل مطلوب",
    passwordMismatch: "كلمتا المرور غير متطابقتين",
    passwordWeak: "كلمة المرور لا تستوفي المتطلبات المطلوبة",
    genericError: "فشل التسجيل",
    unknownError: "خطأ غير معروف",
    reqLength: "8 أحرف على الأقل",
    reqUpper: "حرف كبير (A-Z)",
    reqLower: "حرف صغير (a-z)",
    reqDigit: "رقم (0-9)",
    reqSpecial: "رمز خاص (!@#$...)",
    placeholderName: "أدخل اسمك الكامل",
    placeholderEmail: "أدخل بريدك الإلكتروني",
    placeholderPassword: "أدخل كلمة المرور",
    placeholderConfirm: "أعد إدخال كلمة المرور",
  },
  fr: {
    title: "Créer un compte",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    submit: "S'inscrire",
    submitting: "Inscription en cours...",
    loginLink: "Déjà un compte ? ",
    loginAction: "Se connecter",
    fullNameRequired: "Le nom complet est obligatoire",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    passwordWeak: "Le mot de passe ne répond pas aux exigences requises",
    genericError: "Échec de l'inscription",
    unknownError: "Erreur inconnue",
    reqLength: "Au moins 8 caractères",
    reqUpper: "Une lettre majuscule (A-Z)",
    reqLower: "Une lettre minuscule (a-z)",
    reqDigit: "Un chiffre (0-9)",
    reqSpecial: "Un caractère spécial (!@#$...)",
    placeholderName: "Saisir votre nom complet",
    placeholderEmail: "Saisir votre adresse e-mail",
    placeholderPassword: "Saisir votre mot de passe",
    placeholderConfirm: "Confirmer votre mot de passe",
  },
};

const RegisterPage = () => {
  const [lang, setLang] = useState<Lang>("ar");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const t = T[lang];
  const isRtl = lang === "ar";

  const pwChecks = [
    { key: "length" as const, pass: password.length >= 8, label: t.reqLength },
    { key: "upper" as const, pass: /[A-Z]/.test(password), label: t.reqUpper },
    { key: "lower" as const, pass: /[a-z]/.test(password), label: t.reqLower },
    { key: "digit" as const, pass: /\d/.test(password), label: t.reqDigit },
    { key: "special" as const, pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: t.reqSpecial },
  ];
  const allPwValid = pwChecks.every((c) => c.pass);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError(t.fullNameRequired);
      return;
    }

    if (!allPwValid) {
      setError(t.passwordWeak);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.genericError);
      }
      navigate("/", { state: { success: "Compte créé avec succès" } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.unknownError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <OtdavSidebar />

      {/* Right Side - Register Form */}
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
            <h1 className="text-xl font-bold text-foreground">App-Depot</h1>
            <p className="text-sm text-muted-foreground">OTDAV</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {t.title}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t.fullName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder={t.placeholderName}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder={t.placeholderEmail}
                required
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
                required
              />
              {password.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {pwChecks.map((c) => (
                    <li key={c.key} className="flex items-center gap-1.5 text-xs" style={{ color: c.pass ? "hsl(142 71% 45%)" : "hsl(var(--muted-foreground))" }}>
                      <span>{c.pass ? "✅" : "❌"}</span>
                      <span>{c.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder={t.placeholderConfirm}
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
            {t.loginLink}
            <Link to="/" className="text-primary font-medium hover:underline">
              {t.loginAction}
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
