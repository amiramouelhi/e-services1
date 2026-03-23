import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import DashboardHome from "./pages/DashboardHome";
import DepotsPage from "./pages/DepotsPage";
import UtilisateursPage from "./pages/UtilisateursPage";
import RapportsPage from "./pages/RapportsPage";
import ParametresPage from "./pages/ParametresPage";

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
      </Route>
    </Routes>
  );
}
