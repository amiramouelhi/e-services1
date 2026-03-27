import { useNavigate } from "react-router-dom";

const FcsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="paper-form w-full max-w-lg p-8 text-center">
        <h1 className="text-xl font-bold text-foreground mb-2">الصندوق الإجتماعي — FCS</h1>
        <p className="text-muted-foreground text-sm mb-6">Cette page est en cours de développement.</p>
        <button onClick={() => navigate("/dashboard/fcs")} className="btn-primary">
          ← Retour
        </button>
      </div>
    </div>
  );
};

export default FcsPage;
