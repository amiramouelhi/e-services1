import { useNavigate } from "react-router-dom";
import otdavLogo from "../assets/otdav-logo.png";

const menuItems = [
  { label: "Dépôt", path: "/deposit" },
  { label: "Renouvellement", path: "#" },
  { label: "Indemnités de formation", path: "#" },
  { label: "Indemnités occasionnelles", path: "#" },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Logo */}
      <div className="w-1/3 flex flex-col items-center justify-center bg-card border-r border-border">
        <div className="text-center">
          <div className="mb-6">
            <img src={otdavLogo} alt="OTDAV Logo" className="w-32 h-auto mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-foreground">App-depot</h1>
          <p className="text-base text-muted-foreground mt-1">OTDAV</p>
        </div>
      </div>

      {/* Right Side - Menu */}
      <div className="w-2/3 flex items-center justify-center bg-background">
        <div className="grid grid-cols-2 gap-4 max-w-lg w-full px-8">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="border border-input rounded-lg px-6 py-5 text-center text-foreground font-medium bg-card hover:bg-accent transition-colors shadow-sm"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;