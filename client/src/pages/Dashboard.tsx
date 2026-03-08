import { useNavigate } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const menuItems = [
  { label: "Dépôt", path: "/deposit" },
  { label: "Renouvellement", path: "#" },
  { label: "Indemnités de formation", path: "#" },
  { label: "Indemnités occasionnelles", path: "#" },
];

const menuIcons: Record<string, string> = {
  "Dépôt": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  "Renouvellement": "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  "Indemnités de formation": "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "Indemnités occasionnelles": "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
};

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding Panel */}
      <div
        className="hidden md:flex w-80 lg:w-96 flex-col items-center justify-center relative overflow-hidden flex-shrink-0"
        style={{ background: "hsl(215 60% 22%)" }}
      >
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: "hsl(215 60% 60%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "hsl(215 60% 70%)" }}
        />

        <div className="relative z-10 text-center px-8">
          <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-24 h-auto mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">App-Depot</h1>
          <div className="w-12 h-0.5 bg-white/30 mx-auto my-4" />
          <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed">
            Organisme Tunisien des Droits d'Auteur et des Droits Voisins
          </p>
        </div>
      </div>

      {/* Right Side - Menu */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile header */}
        <div className="md:hidden text-center mb-10">
          <img src={otdavLogo} alt="OTDAV Logo" className="w-16 h-auto mx-auto mb-3" />
          <h1 className="text-lg font-bold text-foreground">App-Depot OTDAV</h1>
        </div>

        <div className="w-full max-w-lg">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Tableau de bord
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sélectionnez une opération
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="group paper-form flex flex-col items-center gap-3 px-6 py-7 text-center
                  hover:border-primary/30 hover:shadow-md transition-all duration-200
                  active:scale-[0.98]"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-200
                    group-hover:bg-primary group-hover:text-white"
                  style={{ background: "hsl(215 45% 94%)", color: "hsl(215 60% 22%)" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={menuIcons[item.label]}
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
