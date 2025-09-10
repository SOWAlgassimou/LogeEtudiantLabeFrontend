import { useState, useEffect } from "react";
import { getAdminUsers, getAdminChambres, getAdminReservations, changeUserRole, getStats } from "../api/admin";
import MessagesAmeliore from "./MessagesAmeliore";
import MessagesAdmin from "./MessagesAdmin";
import Notifications from "./Notifications";
import BarreNavigation from "../composants/BarreNavigation";

function DashboardAdmin() {
  const [onglet, setOnglet] = useState("stats");
  const [users, setUsers] = useState([]);
  const [chambres, setChambres] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (onglet === "stats") {
      getStats().then(data => setStats(data || {})).catch(() => {});
    }
    if (onglet === "users") {
      getAdminUsers().then(data => setUsers(data?.users || [])).catch(() => {});
    }
    if (onglet === "chambres") {
      getAdminChambres().then(data => setChambres(data?.chambres || [])).catch(() => {});
    }
    if (onglet === "reservations") {
      getAdminReservations().then(data => setReservations(data?.reservations || [])).catch(() => {});
    }
  }, [onglet]);

  const changerRole = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      setMessage("✅ Rôle modifié avec succès");
      const data = await getAdminUsers();
      setUsers(data?.users || []);
    } catch (e) {
      setMessage("❌ Erreur lors de la modification");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div>
      <BarreNavigation />
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Dashboard Admin</h2>
        
        {/* Onglets */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {["stats", "users", "chambres", "reservations", "messages", "notifications"].map(tab => (
            <button
              key={tab}
              onClick={() => setOnglet(tab)}
              className={`px-4 py-2 rounded ${onglet === tab ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              {tab === "stats" && "Statistiques"}
              {tab === "users" && "Utilisateurs"}
              {tab === "chambres" && "Chambres"}
              {tab === "reservations" && "Réservations"}
              {tab === "messages" && "Messages"}
              {tab === "notifications" && "Notifications"}
            </button>
          ))}
        </div>

        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}

        {/* Statistiques */}
        {onglet === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-100 p-6 rounded">
              <h3 className="text-lg font-semibold">Utilisateurs</h3>
              <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
            </div>
            <div className="bg-green-100 p-6 rounded">
              <h3 className="text-lg font-semibold">Chambres</h3>
              <p className="text-2xl font-bold">{stats.totalChambres || 0}</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded">
              <h3 className="text-lg font-semibold">Réservations</h3>
              <p className="text-2xl font-bold">{stats.totalReservations || 0}</p>
            </div>
            <div className="bg-purple-100 p-6 rounded">
              <h3 className="text-lg font-semibold">Messages</h3>
              <p className="text-2xl font-bold">{stats.totalMessages || 0}</p>
            </div>
          </div>
        )}

        {/* Utilisateurs */}
        {onglet === "users" && (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Rôle</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-t">
                    <td className="px-4 py-3">{user.nom}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === "admin" ? "bg-red-100 text-red-800" :
                        user.role === "proprietaire" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        onChange={(e) => changerRole(user._id, e.target.value)}
                        className="border rounded px-2 py-1"
                        defaultValue={user.role}
                      >
                        <option value="etudiant">Étudiant</option>
                        <option value="proprietaire">Propriétaire</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Chambres */}
        {onglet === "chambres" && (
          <div className="grid gap-4">
            {chambres.map(ch => (
              <div key={ch._id} className="bg-white p-4 rounded shadow flex justify-between">
                <div>
                  <h3 className="font-semibold">{ch.bloc} - {ch.numero}</h3>
                  <p>Prix: {ch.prix?.toLocaleString()} GNF</p>
                  <p>Propriétaire: {ch.proprietaire?.nom}</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    ch.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {ch.disponible ? "Disponible" : "Réservée"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Réservations */}
        {onglet === "reservations" && (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Étudiant</th>
                  <th className="px-4 py-3 text-left">Chambre</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res._id} className="border-t">
                    <td className="px-4 py-3">{res.etudiant?.nom || res.user?.nom}</td>
                    <td className="px-4 py-3">{res.chambre?.bloc} - {res.chambre?.numero}</td>
                    <td className="px-4 py-3">{new Date(res.createdAt || res.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        res.statut === "confirmée" ? "bg-green-100 text-green-800" :
                        res.statut === "annulée" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {res.statut || "en attente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Messages */}
        {onglet === "messages" && <MessagesAdmin />}

        {/* Notifications */}
        {onglet === "notifications" && <Notifications />}
      </main>
    </div>
  );
}

export default DashboardAdmin;