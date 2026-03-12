import { useNavigate } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const menuItems = [
  { label: "Dépôt", desc: "Déposer une nouvelle œuvre", path: "/deposit" },
  { label: "Mes Dépôts / إيداعاتي", desc: "Suivre vos demandes", path: "/mes-depots" },
  { label: "Renouvellement", desc: "Renouveler un dépôt", path: "#" },
  { label: "Indemnités de formation", desc: "Demande d'indemnités", path: "#" },
  { label: "Indemnités occasionnelles", desc: "Indemnités ponctuelles", path: "#" },
];

const menuIcons: Record<string, string> = {
  "Dépôt": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  "Mes Dépôts / إيداعاتي": "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  "Renouvellement": "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  "Indemnités de formation": "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "Indemnités occasionnelles": "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
};

const CardButton = ({ item, navigate }: { item: typeof menuItems[number]; navigate: ReturnType<typeof useNavigate> }) => (
  <button
    onClick={() => navigate(item.path)}
    className="group paper-form flex flex-col items-center justify-center gap-4 px-5 text-center
      w-[280px] h-[180px]
      hover:border-primary/30 hover:shadow-lg hover:scale-[1.03] transition-all duration-200
      active:scale-[0.98]"
  >
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-200
        group-hover:bg-primary group-hover:text-white"
      style={{ background: "hsl(215 45% 94%)", color: "hsl(215 60% 22%)" }}
    >
      <svg
        className="w-7 h-7"
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
    <div>
      <span className="text-sm font-semibold text-foreground block">{item.label}</span>
      <span className="text-xs text-muted-foreground mt-1 block">{item.desc}</span>
    </div>
  </button>
);

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
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-8">
        {/* Mobile header */}
        <div className="md:hidden text-center mb-8">
          <img src={otdavLogo} alt="OTDAV Logo" className="w-16 h-auto mx-auto mb-3" />
          <h1 className="text-lg font-bold text-foreground">App-Depot OTDAV</h1>
        </div>

        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Tableau de bord
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sélectionnez une opération
            </p>
          </div>

          {/* Row 1 — Dépôt + Renouvellement */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
            <CardButton item={menuItems[0]} navigate={navigate} />
            <CardButton item={menuItems[2]} navigate={navigate} />
          </div>

          {/* Row 2 — Mes Dépôts centered */}
          <div className="flex justify-center mb-4">
            <CardButton item={menuItems[1]} navigate={navigate} />
          </div>

          {/* Row 3 — Indemnités occasionnelles + Indemnités de formation */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <CardButton item={menuItems[4]} navigate={navigate} />
            <CardButton item={menuItems[3]} navigate={navigate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
