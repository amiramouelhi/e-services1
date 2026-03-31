import { Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage, { DepotDashboard, FcsDashboard } from "./pages/Dashboard"
import DepositPage from "./pages/DepositPage"
import MesDepotsPage from "./pages/MesDepots"
import FacturePage from "./pages/FacturePage"
import RenouvellementPage from "./pages/RenouvellementPage"
import IndemnitesOccasionnellesPage from "./pages/IndemnitesOccasionnellesPage"
import FcsPage from "./pages/FcsPage"
import StatistiquesPage from "./pages/StatistiquesShared"
import RegistreGeneralPage from "./pages/RegistreGeneral"
import RegistreAnnuelPage from "./pages/RegistreAnnuel"
import ParCategoriePage from "./pages/ParCategorie"
import ParDeposantPage from "./pages/ParDeposant"
import ParAuteurPage from "./pages/ParAuteur"
import ParGouvernoratPage from "./pages/ParGouvernorat"
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/depot" element={<DepotDashboard />} />
      <Route path="/dashboard/fcs" element={<FcsDashboard />} />
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
    </Routes>
  )
}
