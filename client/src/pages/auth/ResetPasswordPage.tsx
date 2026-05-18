import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import otdavLogo from "../../assets/otdav-logo.png";
import OtdavSidebar from "../../components/OtdavSidebar";
import { useAuthLang } from "../../hooks/useAuthLang";

const T = {
  ar: {
    title: "إعادة تعيين كلمة المرور",
    subtitle: "أدخل الرمز الذي أرسلناه إلى",
    codeLabel: "رمز التحقق",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    placeholderPassword: "أدخل كلمة المرور الجديدة",
    placeholderConfirm: "أعد إدخال كلمة المرور",
    submit: "تغيير كلمة المرور",
    submitting: "...جارٍ التغيير",
    backToLogin: "العودة إلى تسجيل الدخول",
    missingEmail: "لم يتم العثور على البريد الإلكتروني. ابدأ من البداية.",
    codeRequired: "يرجى إدخال الرمز المكون من 6 أرقام",
    passwordMismatch: "كلمتا المرور غير متطابقتين",
    passwordWeak: "كلمة المرور لا تستوفي المتطلبات المطلوبة",
    genericError: "فشل إعادة التعيين",
    unknownError: "خطأ غير معروف",
    successMessage: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
    reqLength: "8 أحرف على الأقل",
    reqUpper: "حرف كبير (A-Z)",
    reqLower: "حرف صغير (a-z)",
    reqDigit: "رقم (0-9)",
    reqSpecial: "رمز خاص (!@#$...)",
  },
  fr: {
    title: "Réinitialiser le mot de passe",
    subtitle: "Entrez le code que nous avons envoyé à",
    codeLabel: "Code de vérification",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    placeholderPassword: "Saisir le nouveau mot de passe",
    placeholderConfirm: "Confirmer le mot de passe",
    submit: "Changer le mot de passe",
    submitting: "Enregistrement...",
    backToLogin: "Retour à la connexion",
    missingEmail: "Adresse e-mail manquante. Recommencez depuis le début.",
    codeRequired: "Veuillez saisir le code à 6 chiffres",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    passwordWeak: "Le mot de passe ne répond pas aux exigences requises",
    genericError: "Échec de la réinitialisation",
    unknownError: "Erreur inconnue",
    successMessage: "Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.",
    reqLength: "Au moins 8 caractères",
    reqUpper: "Une lettre majuscule (A-Z)",
    reqLower: "Une lettre minuscule (a-z)",
    reqDigit: "Un chiffre (0-9)",
    reqSpecial: "Un caractère spécial (!@#$...)",
  },
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { email?: string } | null) ?? null;
  const email = state?.email ?? "";

  const [lang, setLang] = useAuthLang();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

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

  useEffect(() => {
    if (!email) setError(t.missingEmail);
  }, [email, t.missingEmail]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleDigitChange = (idx: number, value: string) => {
    const onlyDigit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = onlyDigit;
      return next;
    });
    if (onlyDigit && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) inputsRef.current[idx - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const code = digits.join("");
    if (code.length !== 6) {
      setError(t.codeRequired);
      return;
    }
    if (!email) {
      setError(t.missingEmail);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.genericError);
      navigate("/", { state: { success: t.successMessage } });
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
            {email && (
              <p className="text-sm text-muted-foreground mt-2">
                {t.subtitle}
                <br />
                <strong className="text-foreground">{email}</strong>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 text-center">
                {t.codeLabel}
              </label>
              <div className="flex justify-center gap-2" dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-11 h-12 text-center text-xl font-semibold rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t.newPassword}</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder={t.placeholderPassword}
                  required
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
              {password.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {pwChecks.map((c) => (
                    <li
                      key={c.key}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: c.pass ? "hsl(142 71% 45%)" : "hsl(var(--muted-foreground))" }}
                    >
                      <span>{c.pass ? "✅" : "❌"}</span>
                      <span>{c.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t.confirmPassword}</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder={t.placeholderConfirm}
                  required
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
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
                  {showConfirm ? (
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

            <button
              type="submit"
              disabled={submitting || !email}
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

export default ResetPasswordPage;
