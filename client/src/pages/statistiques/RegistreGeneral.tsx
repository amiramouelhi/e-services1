import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type DepotFull, LoadingState, ErrorState, StatDepotTable, PageShell } from "./StatistiquesShared";

const RegistreGeneralPage = () => {
  const navigate = useNavigate();
  const [depots, setDepots] = useState<DepotFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    fetch(`${import.meta.env.VITE_API_URL}/depots`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error("Erreur serveur"); return r.json(); })
      .then((data) => { setDepots(data); setLoading(false); })
      .catch((e) => { setError(e.message || "Erreur de chargement"); setLoading(false); });
  }, [navigate]);

  return (
    <PageShell title="Registre général — السجل العام" backTo="/statistiques">
      {loading ? <LoadingState /> : error ? <ErrorState msg={error} /> : <StatDepotTable depots={depots} />}
    </PageShell>
  );
};

export default RegistreGeneralPage;
