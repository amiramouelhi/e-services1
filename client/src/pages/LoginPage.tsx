import { useState } from "react";
import { useNavigate } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Logo */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-card border-r border-border">
        <div className="text-center">
          <div className="mb-6">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-36 h-auto mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">App-depot</h1>
          <p className="text-lg text-muted-foreground mt-1">OTDAV</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-background">
        <div className="w-full max-w-sm px-8">
          <h2 className="text-xl font-semibold text-foreground mb-8 text-center">
            Login Page
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Login :
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Mot de passe :
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;