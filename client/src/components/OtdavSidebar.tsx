import { useNavigate } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const OtdavSidebar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
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

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="absolute bottom-8 z-10 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-white/30 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Déconnexion / تسجيل الخروج
        </button>
      )}
    </div>
  );
};

export default OtdavSidebar;
