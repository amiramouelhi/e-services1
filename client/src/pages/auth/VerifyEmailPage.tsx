import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import otdavLogo from "../../assets/otdav-logo.png";
import OtdavSidebar from "../../components/OtdavSidebar";
import { useAuthLang } from "../../hooks/useAuthLang";

const T = {
  ar: {
    title: "التحقق من البريد الإلكتروني",
    subtitle: "لقد أرسلنا رمزاً مكوناً من 6 أرقام إلى",
    codeLabel: "رمز التحقق",
    submit: "تأكيد",
    submitting: "...جارٍ التأكيد",
    resend: "إعادة إرسال الرمز",
    resending: "...جارٍ الإرسال",
    resentOk: "تم إرسال رمز جديد",
    backToLogin: "العودة إلى تسجيل الدخول",
    missingEmail: "لم يتم العثور على البريد الإلكتروني. يرجى التسجيل مجدداً.",
    codeRequired: "يرجى إدخال الرمز المكون من 6 أرقام",
    genericError: "فشل التحقق",
    unknownError: "خطأ غير معروف",
    successMessage: "تم التحقق من البريد الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.",
  },
  fr: {
    title: "Vérification de l'e-mail",
    subtitle: "Nous avons envoyé un code à 6 chiffres à",
    codeLabel: "Code de vérification",
    submit: "Vérifier",
    submitting: "Vérification...",
    resend: "Renvoyer le code",
    resending: "Envoi...",
    resentOk: "Nouveau code envoyé",
    backToLogin: "Retour à la connexion",
    missingEmail: "Adresse e-mail manquante. Veuillez vous réinscrire.",
    codeRequired: "Veuillez saisir le code à 6 chiffres",
    genericError: "Échec de la vérification",
    unknownError: "Erreur inconnue",
    successMessage: "Votre e-mail a été vérifié avec succès. Vous pouvez maintenant vous connecter.",
  },
};

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { email?: string } | null) ?? null;
  const email = state?.email ?? "";

  const [lang, setLang] = useAuthLang();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const t = T[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    if (!email) {
      setError(t.missingEmail);
    }
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
    if (onlyDigit && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
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
    setInfo("");

    const code = digits.join("");
    if (code.length !== 6) {
      setError(t.codeRequired);
      return;
    }
    if (!email) {
      setError(t.missingEmail);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
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

  const handleResend = async () => {
    setError("");
    setInfo("");
    if (!email) {
      setError(t.missingEmail);
      return;
    }
    setResending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.genericError);
      setInfo(t.resentOk);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.unknownError);
    } finally {
      setResending(false);
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
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {t.title}
            </h2>
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
            {info && (
              <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                {info}
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

            <button
              type="submit"
              disabled={submitting || !email}
              className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? t.submitting : t.submit}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="text-sm text-primary font-medium hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resending ? t.resending : t.resend}
            </button>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
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

export default VerifyEmailPage;
