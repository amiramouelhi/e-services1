import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SpectaclesPageComponent from "./SpectaclesPage";
import RepartitionLicencesPage from "./RepartitionLicences";
interface PlaceholderProps {
  ar: string;
  fr: string;
}

const AutorisationPlaceholder = ({ ar, fr }: PlaceholderProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="paper-form w-full max-w-lg p-8 text-center">
        <h1 className="text-xl font-bold text-foreground mb-1" dir="rtl">{ar}</h1>
        <h2 className="text-base font-semibold text-muted-foreground mb-4">{fr}</h2>
        <p className="text-muted-foreground text-sm mb-6">
          الصفحة قيد التطوير / Page en cours de développement
        </p>
        <button onClick={() => navigate("/dashboard/autorisation")} className="btn-primary">
          ← Retour
        </button>
      </div>
    </div>
  );
};

export const SpectaclesPage = () => <SpectaclesPageComponent />;
export const MusiqueGeneralePage = () => <AutorisationPlaceholder ar="موسيقى عامة" fr="Musique générale" />;
export const SallesFetesPage = () => <AutorisationPlaceholder ar="قاعات أفراح" fr="Salles des fêtes" />;
export const CliniquesPage = () => <AutorisationPlaceholder ar="مصحات" fr="Cliniques" />;
export const CafesRestaurantsPage = () => <AutorisationPlaceholder ar="مقاهي + قاعات شاي + مطاعم" fr="Cafés + Salons de thé + Restaurants" />;
export const SallesSportPage = () => <AutorisationPlaceholder ar="قاعات رياضة" fr="Salles de sport" />;
export const TransportPage = () => <AutorisationPlaceholder ar="وسائل نقل" fr="Moyens de transport" />;
export const HotelsPage = () => <AutorisationPlaceholder ar="نُزُل" fr="Hôtels" />;
export const RadiosPage = () => <AutorisationPlaceholder ar="إذاعات" fr="Radios" />;
export const TelevisionsPage = () => <AutorisationPlaceholder ar="تلفزات" fr="Télévisions" />;
export const SocietesVaPage = () => <AutorisationPlaceholder ar="شركات ذات قيمة مضافة" fr="Sociétés à valeur ajoutée" />;
export const AutorisationStatistiquesPage = () => <RepartitionLicencesPage />;
