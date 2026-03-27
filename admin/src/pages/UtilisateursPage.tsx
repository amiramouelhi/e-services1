import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  fullName: string | null;
  email: string;
  createdAt: string;
  canDepot: boolean;
  canFCS: boolean;
  _count: { depots: number };
}

const getToken = () => localStorage.getItem("adminToken");

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const UtilisateursPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggleError, setToggleError] = useState("");

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch("http://localhost:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
      const data: User[] = await res.json();
      setUsers(data);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (userId: number, field: "canDepot" | "canFCS") => {
    const token = getToken();
    if (!token) return;

    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newValue = !user[field];
    const body = {
      canDepot: field === "canDepot" ? newValue : user.canDepot,
      canFCS: field === "canFCS" ? newValue : user.canFCS,
    };

    // Optimistic update
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, [field]: newValue } : u));
    setToggleError("");

    try {
      const res = await fetch(`http://localhost:5000/admin/users/${userId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur lors de la mise à jour");
      }
    } catch (err: unknown) {
      // Revert on error
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, [field]: !newValue } : u));
      setToggleError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
          Utilisateurs / المستخدمون
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          {!loading && !error && `${users.length} utilisateur${users.length !== 1 ? "s" : ""} au total`}
          {loading && "Chargement..."}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="paper-form p-16 flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-[3px] rounded-full animate-spin"
            style={{ borderColor: "hsl(var(--primary) / 0.2)", borderTopColor: "hsl(var(--primary))" }}
          />
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Chargement...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "hsl(var(--destructive) / 0.1)",
            border: "1px solid hsl(var(--destructive) / 0.3)",
            color: "hsl(var(--destructive))",
          }}
        >
          {error}
        </div>
      )}

      {/* Toggle error toast */}
      {toggleError && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "hsl(var(--destructive) / 0.1)",
            border: "1px solid hsl(var(--destructive) / 0.3)",
            color: "hsl(var(--destructive))",
          }}
        >
          {toggleError}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="paper-form overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "hsl(215 45% 94%)" }}>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Nom complet</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Email</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Date d'inscription</th>
                  <th className="text-center px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Depots</th>
                  <th className="text-center px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>Depot des Oeuvres</th>
                  <th className="text-center px-5 py-3 font-semibold" style={{ color: "hsl(var(--foreground))" }}>FCS</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Aucun utilisateur pour le moment
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid hsl(var(--border))" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "hsl(var(--muted) / 0.3)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-4 font-medium max-w-[200px] truncate" style={{ color: "hsl(var(--foreground))" }}>
                      {user.fullName || "—"}
                    </td>
                    <td className="px-5 py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {user.email}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-center font-medium" style={{ color: "hsl(var(--foreground))" }}>
                      {user._count.depots}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          enabled={user.canDepot}
                          onToggle={() => handleToggle(user.id, "canDepot")}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          enabled={user.canFCS}
                          onToggle={() => handleToggle(user.id, "canFCS")}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
    style={{ background: enabled ? "hsl(142 71% 45%)" : "hsl(215 15% 75%)" }}
  >
    <span
      className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
      style={{ transform: enabled ? "translateX(22px)" : "translateX(4px)" }}
    />
  </button>
);

export default UtilisateursPage;
