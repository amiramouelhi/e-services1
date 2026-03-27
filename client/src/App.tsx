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
    </Routes>
  )
}
