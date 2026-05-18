import { useNavigate } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";
import OtdavSidebar from "../components/OtdavSidebar";

interface DashCard {
  ar: string;
  fr: string;
  path: string;
  locked?: boolean;
}


const MobileHeader = () => (
  <div className="md:hidden text-center mb-8">
    <img src={otdavLogo} alt="OTDAV Logo" className="w-16 h-auto mx-auto mb-3" />
    <h1 className="text-lg font-bold text-foreground">App-Depot OTDAV</h1>
  </div>
);

const CardButton = ({ card, navigate }: { card: DashCard; navigate: ReturnType<typeof useNavigate> }) => (
  <div className="relative">
    <button
      onClick={() => !card.locked && navigate(card.path)}
      className="group paper-form flex flex-col items-center justify-center gap-3 px-6 text-center
        w-[300px] h-[200px]
        hover:border-primary/30 hover:shadow-lg hover:scale-[1.03] transition-all duration-200
        active:scale-[0.98]"
      style={card.locked ? { filter: "blur(2px)", opacity: 0.5, pointerEvents: "none" } : undefined}
    >
      <span className="text-xl font-bold text-foreground leading-snug" dir="rtl">
        {card.ar}
      </span>
      <div className="w-10 h-0.5 bg-border" />
      <span className="text-sm font-semibold text-muted-foreground">
        {card.fr}
      </span>
    </button>
    {card.locked && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-4xl">🔒</span>
      </div>
    )}
  </div>
);

const BackButton = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => (
  <button
    onClick={() => navigate("/dashboard")}
    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
    Retour
  </button>
);

/* ─── Main Dashboard ─── */

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canDepot = user?.canDepot;
  const canFCS = user?.canFCS;
  const cards: DashCard[] = [
    { ar: "إيداع المصنفات", fr: "Dépôt des Oeuvres", path: "/dashboard/depot", locked: canDepot === false },
    { ar: "الصندوق الإجتماعي و المنح الظرفية", fr: "FCS & Indemnités occasionnelles", path: "/dashboard/fcs", locked: canFCS === false },
    { ar: "تراخيص", fr: "Autorisation", path: "/dashboard/autorisation" },
  ];

  return (
    <div className="flex min-h-screen">
      <OtdavSidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-8">
        <MobileHeader />
        <div className="w-full max-w-4xl">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6">
            {cards.map((c) => (
              <CardButton key={c.path} card={c} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

/* ─── Depot Sub-Dashboard ─── */

export const DepotDashboard = () => {
  const navigate = useNavigate();
  const cards: DashCard[] = [
    { ar: "  إيداع جديد ", fr: "Dépôt", path: "/deposit" },
    { ar: " تجديد إيداع", fr: "Renouvellement", path: "/renouvellement" },
    { ar: "إحصائيات", fr: "Statistiques", path: "/statistiques" },
  ];

  return (
    <div className="flex min-h-screen">
      <OtdavSidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-8">
        <MobileHeader />
        <div className="w-full max-w-3xl">
          <BackButton navigate={navigate} />
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-foreground tracking-tight">إيداع المصنفات — Dépôt des Oeuvres</h2>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            {cards.map((c) => (
              <CardButton key={c.path} card={c} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── FCS Sub-Dashboard ─── */

export const FcsDashboard = () => {
  const navigate = useNavigate();
  const cards: DashCard[] = [
    { ar: "المنح الظرفية", fr: "Indemnités occasionnelles", path: "/indemnites-occasionnelles" },
    { ar: "الصندوق الإجتماعي", fr: "FCS", path: "/fcs" },
  ];

  return (
    <div className="flex min-h-screen">
      <OtdavSidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-8">
        <MobileHeader />
        <div className="w-full max-w-2xl">
          <BackButton navigate={navigate} />
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-foreground tracking-tight">الصندوق الإجتماعي و المنح الظرفية — FCS & Indemnités</h2>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            {cards.map((c) => (
              <CardButton key={c.path} card={c} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Autorisation Sub-Dashboard ─── */

export const AutorisationDashboard = () => {
  const navigate = useNavigate();
  const cards: DashCard[] = [
    { ar: "عروض", fr: "Spectacles", path: "/autorisation/spectacles" },
    { ar: "موسيقى عامة", fr: "Musique générale", path: "/autorisation/musique-generale" },
    { ar: "قاعات أفراح", fr: "Salles des fêtes", path: "/autorisation/salles-fetes" },
    { ar: "مصحات", fr: "Cliniques", path: "/autorisation/cliniques" },
    { ar: "مقاهي + قاعات شاي + مطاعم", fr: "Cafés + Salons de thé + Restaurants", path: "/autorisation/cafes-restaurants" },
    { ar: "قاعات رياضة", fr: "Salles de sport", path: "/autorisation/salles-sport" },
    { ar: "وسائل نقل", fr: "Moyens de transport", path: "/autorisation/transport" },
    { ar: "نُزُل", fr: "Hôtels", path: "/autorisation/hotels" },
    { ar: "إذاعات", fr: "Radios", path: "/autorisation/radios" },
    { ar: "تلفزات", fr: "Télévisions", path: "/autorisation/televisions" },
    { ar: "شركات ذات قيمة مضافة", fr: "Sociétés à valeur ajoutée", path: "/autorisation/societes-va" },
    { ar: "إحصائيات", fr: "Statistiques", path: "/autorisation/statistiques" },
  ];

  return (
    <div className="flex min-h-screen">
      <OtdavSidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-8">
        <MobileHeader />
        <div className="w-full max-w-5xl">
          <BackButton navigate={navigate} />
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-foreground tracking-tight">تراخيص — Autorisation</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center gap-6">
            {cards.map((c) => (
              <CardButton key={c.path} card={c} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
