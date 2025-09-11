import { useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import TableauEtudiant from "./TableauEtudiant";
import ReservationsEtudiant from "./ReservationsEtudiant";
import MessagesAmeliore from "./MessagesAmeliore";
import Notifications from "./Notifications";
import ProfilUtilisateur from "./ProfilUtilisateur";
import TabButton from "../composants/TabButton";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

const ProfilContent = memo(() => {
  return <ProfilUtilisateur />;
});

function OngletsEtudiant() {
  const [onglet, setOnglet] = useState(null);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { getUnreadCount } = useNotifications();
  
  const utilisateur = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("utilisateurConnecte"));
    } catch {
      return null;
    }
  }, []);
  
  const unreadCount = useMemo(() => getUnreadCount(), [getUnreadCount]);

  const handleLogout = useCallback(() => {
    setShowConfirm(false);
    logout();
  }, [logout]);

  const handleTabClick = useCallback((tab) => {
    setOnglet(tab);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOuvert(v => !v);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      {/* Bouton utilisateur en haut à droite */}
      {utilisateur && (
        <div className="absolute top-4 right-6">
          <button
            onClick={toggleMenu}
            className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded shadow hover:bg-green-200"
          >
            <span className="font-semibold text-green-700">
              {utilisateur.nom || "Connecté"}
            </span>
            <svg width="18" height="18" fill="currentColor"><circle cx="9" cy="9" r="8" stroke="green" strokeWidth="2" fill="white" /></svg>
          </button>
          {menuOuvert && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow p-2 z-10">
              <button
                onClick={() => { setMenuOuvert(false); setShowConfirm(true); }}
                className="text-red-600 hover:underline px-2 py-1 w-full text-left"
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation de déconnexion */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="mb-4 text-lg">Voulez-vous vraiment vous déconnecter ?</p>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded mr-2"
            >
              Oui, déconnecter
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Message de bienvenue */}
      {utilisateur && (
        <div className="mb-16 text-center">
          <span className="text-2xl font-semibold text-green-700">
            Bienvenue {utilisateur.nom ? utilisateur.nom : ""} sur votre espace étudiant ! <br /> <br /> <br /> <br /> <br />
          </span>
        </div>
      )}

      {/* Onglets avec logos */}
      <div className="flex justify-center mb-10 gap-4 flex-wrap">
        <TabButton
          isActive={onglet === "chambres"}
          onClick={() => handleTabClick("chambres")}
          icon="/logo-chambre.png"
          label="Chambres disponibles"
          size="small"
        />
        
        <div
          className={`flex flex-col items-center cursor-pointer p-6 bg-white rounded shadow transition-all duration-200 hover:shadow-2xl hover:bg-blue-50 ${onglet === "reservations" ? "ring-2 ring-blue-400" : ""}`}
          onClick={() => handleTabClick("reservations")}
          style={{ minWidth: 200 }}
        >
          <img src="/logo-reservation.png" alt="Réservations" style={{ width: 90, height: 90 }} className="mb-4" />
          <span className={`font-semibold text-xl ${onglet === "reservations" ? "text-blue-600 underline" : ""}`}>
            Mes Réservations
          </span>
        </div>

        <div
          className={`flex flex-col items-center cursor-pointer p-6 bg-white rounded shadow transition-all duration-200 hover:shadow-2xl hover:bg-blue-50 ${onglet === "messages" ? "ring-2 ring-blue-400" : ""}`}
          onClick={() => handleTabClick("messages")}
          style={{ minWidth: 200 }}
        >
          <img src="/logo-reservation.png" alt="Messages" style={{ width: 90, height: 90 }} className="mb-4" />
          <span className={`font-semibold text-xl ${onglet === "messages" ? "text-blue-600 underline" : ""}`}>
            Messages
          </span>
        </div>
        <div
          className={`flex flex-col items-center cursor-pointer p-6 bg-white rounded shadow transition-all duration-200 hover:shadow-2xl hover:bg-blue-50 ${onglet === "notifications" ? "ring-2 ring-blue-400" : ""}`}
          onClick={() => handleTabClick("notifications")}
          style={{ minWidth: 200 }}
        >
          <img src="/logo-chambre.png" alt="Notifications" style={{ width: 90, height: 90 }} className="mb-4" />
          <div className="relative">
            <span className={`font-semibold text-xl ${onglet === "notifications" ? "text-blue-600 underline" : ""}`}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        <TabButton
          isActive={onglet === "profil"}
          onClick={() => handleTabClick("profil")}
          icon="/logo-profil.png"
          label="Mon Profil"
          size="small"
        />  
      </div>
      <div>
        {onglet === "chambres" && <TableauEtudiant allerReservations={() => setOnglet("reservations")} />}
        {onglet === "reservations" && <ReservationsEtudiant />}
        {onglet === "messages" && <MessagesAmeliore />}
        {onglet === "notifications" && <Notifications onNavigateToMessages={() => setOnglet("messages")} />}
        {onglet === "profil" && <ProfilContent />}
      </div>
    </div>
  );
}

export default memo(OngletsEtudiant);