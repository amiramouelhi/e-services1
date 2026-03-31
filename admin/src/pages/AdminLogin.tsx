import { useState } from "react";
import { useNavigate } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion");
      localStorage.setItem("adminToken", data.token);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
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
      <div
        className="w-full md:w-1/2 flex items-center justify-center px-6"
        style={{ background: "hsl(var(--background))" }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-10">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-20 h-auto mx-auto mb-3" />
            <h1 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
              OTDAV Connect
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Panneau d'administration
            </p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
              Connexion / تسجيل الدخول
            </h2>
            <p className="text-sm mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              Accedez au panneau d'administration
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Adresse e-mail / البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="admin@otdav.tn"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Mot de passe / كلمة المرور
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Saisir votre mot de passe"
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
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? "Connexion en cours..." : "Se connecter / دخول"}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            OTDAV &mdash; Tous droits reserves
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
