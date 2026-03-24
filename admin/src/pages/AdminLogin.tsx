import { useState } from "react";
import { useNavigate } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="Saisir votre mot de passe"
              />
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
