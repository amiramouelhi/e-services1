import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import DashboardHome from "./pages/DashboardHome";
import DepotsPage from "./pages/DepotsPage";
import UtilisateursPage from "./pages/UtilisateursPage";
import RapportsPage from "./pages/RapportsPage";
import ParametresPage from "./pages/ParametresPage";
import OrganisateursPage from "./pages/OrganisateursPage";
import AutorisationsSuiviPage from "./pages/AutorisationsSuiviPage";
import AutorisationDetailPage from "./pages/AutorisationDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/dashboard" element={<AdminLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="depots" element={<DepotsPage />} />
        <Route path="utilisateurs" element={<UtilisateursPage />} />
        <Route path="rapports" element={<RapportsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
        <Route path="organisateurs" element={<OrganisateursPage />} />
        <Route path="autorisations" element={<AutorisationsSuiviPage />} />
        <Route path="autorisations/:id" element={<AutorisationDetailPage />} />
      </Route>
    </Routes>
  );
}
