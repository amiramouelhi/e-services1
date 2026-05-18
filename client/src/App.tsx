import { Routes, Route } from "react-router-dom"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import DashboardPage, { DepotDashboard, FcsDashboard, AutorisationDashboard } from "./pages/Dashboard"
import DepositPage from "./pages/depots/DepositPage"
import MesDepotsPage from "./pages/MesDepots"
import FacturePage from "./pages/depots/FacturePage"
import RenouvellementPage from "./pages/renouvellement/RenouvellementPage"
import IndemnitesOccasionnellesPage from "./pages/IndemnitesOccasionnellesPage"
import FcsPage from "./pages/FcsPage"
import StatistiquesPage from "./pages/statistiques/StatistiquesShared"
import RegistreGeneralPage from "./pages/statistiques/RegistreGeneral"
import RegistreAnnuelPage from "./pages/statistiques/RegistreAnnuel"
import ParCategoriePage from "./pages/statistiques/ParCategorie"
import ParDeposantPage from "./pages/statistiques/ParDeposant"
import ParAuteurPage from "./pages/statistiques/ParAuteur"
import ParGouvernoratPage from "./pages/statistiques/ParGouvernorat"
import RepartitionLicencesPage from "./pages/autorisation/RepartitionLicences"
import AutorisationFacturePage from "./pages/autorisation/AutorisationFacturePage"
import {
  SpectaclesPage,
  MusiqueGeneralePage,
  SallesFetesPage,
  CliniquesPage,
  CafesRestaurantsPage,
  SallesSportPage,
  TransportPage,
  HotelsPage,
  RadiosPage,
  TelevisionsPage,
  SocietesVaPage,
  AutorisationStatistiquesPage,
} from "./pages/autorisation/AutorisationPages"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/depot" element={<DepotDashboard />} />
      <Route path="/dashboard/fcs" element={<FcsDashboard />} />
      <Route path="/dashboard/autorisation" element={<AutorisationDashboard />} />
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/mes-depots" element={<MesDepotsPage />} />
      <Route path="/facture/:id" element={<FacturePage />} />
      <Route path="/renouvellement" element={<RenouvellementPage />} />
      <Route path="/indemnites-occasionnelles" element={<IndemnitesOccasionnellesPage />} />
      <Route path="/fcs" element={<FcsPage />} />
      <Route path="/statistiques" element={<StatistiquesPage />} />
      <Route path="/statistiques/registre-general" element={<RegistreGeneralPage />} />
      <Route path="/statistiques/registre-annuel" element={<RegistreAnnuelPage />} />
      <Route path="/statistiques/par-categorie" element={<ParCategoriePage />} />
      <Route path="/statistiques/par-deposant" element={<ParDeposantPage />} />
      <Route path="/statistiques/par-auteur" element={<ParAuteurPage />} />
      <Route path="/statistiques/par-gouvernorat" element={<ParGouvernoratPage />} />
      <Route path="/statistiques/repartition-licences" element={<RepartitionLicencesPage />} />
      <Route path="/autorisation/facture/:id" element={<AutorisationFacturePage />} />
      <Route path="/autorisation/spectacles" element={<SpectaclesPage />} />
      <Route path="/autorisation/musique-generale" element={<MusiqueGeneralePage />} />
      <Route path="/autorisation/salles-fetes" element={<SallesFetesPage />} />
      <Route path="/autorisation/cliniques" element={<CliniquesPage />} />
      <Route path="/autorisation/cafes-restaurants" element={<CafesRestaurantsPage />} />
      <Route path="/autorisation/salles-sport" element={<SallesSportPage />} />
      <Route path="/autorisation/transport" element={<TransportPage />} />
      <Route path="/autorisation/hotels" element={<HotelsPage />} />
      <Route path="/autorisation/radios" element={<RadiosPage />} />
      <Route path="/autorisation/televisions" element={<TelevisionsPage />} />
      <Route path="/autorisation/societes-va" element={<SocietesVaPage />} />
      <Route path="/autorisation/statistiques" element={<AutorisationStatistiquesPage />} />
    </Routes>
  )
}
