import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TableauEtudiant from "./TableauEtudiant";
import ReservationsEtudiant from "./ReservationsEtudiant";

export default function OngletsEtudiant() {
  const [onglet, setOnglet] = useState(null);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const utilisateur = JSON.parse(localStorage.getItem("utilisateurConnecte"));
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowConfirm(false);
    localStorage.removeItem("utilisateurConnecte");
    // Ajoute ici d'autres nettoyages si besoin
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      {/* Bouton utilisateur en haut à droite */}
      {utilisateur && (
        <div className="absolute top-4 right-6">
          <button
            onClick={() => setMenuOuvert((v) => !v)}
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
      <div className="flex justify-center mb-10 gap-16">
        <div
          className={`flex flex-col items-center cursor-pointer p-6 bg-white rounded shadow transition-all duration-200 hover:shadow-2xl hover:bg-blue-50 ${onglet === "chambres" ? "ring-2 ring-blue-400" : ""}`}
          onClick={() => setOnglet("chambres")}
          style={{ minWidth: 200 }}
        >
          <img src="/logo-chambre.png" alt="Chambres" style={{ width: 90, height: 90 }} className="mb-4" />
          <span className={`font-semibold text-xl ${onglet === "chambres" ? "text-blue-600 underline" : ""}`}>
            Chambres disponibles
          </span>
        </div>
        
        <div
          className={`flex flex-col items-center cursor-pointer p-6 bg-white rounded shadow transition-all duration-200 hover:shadow-2xl hover:bg-blue-50 ${onglet === "reservations" ? "ring-2 ring-blue-400" : ""}`}
          onClick={() => setOnglet("reservations")}
          style={{ minWidth: 200 }}
        >
          <img src="/logo-reservation.png" alt="Réservations" style={{ width: 90, height: 90 }} className="mb-4" />
          <span className={`font-semibold text-xl ${onglet === "reservations" ? "text-blue-600 underline" : ""}`}>
            Mes Réservations
          </span>
        </div>

        <div
          className={`flex flex-col items-center cursor-pointer p-6 bg-white rounded shadow transition-all duration-200 hover:shadow-2xl hover:bg-blue-50 ${onglet === "profil" ? "ring-2 ring-blue-400" : ""}`}
          onClick={() => navigate("/profil")}
          style={{ minWidth: 200 }}
        >
          <img src="/logo-profil.png" alt="Profil" style={{ width: 90, height: 90 }} className="mb-4" />
          <span className="font-semibold text-xl text-blue-600 hover:underline">
            Mon Profil
          </span>
        </div>  
      </div>
      <div>
        {onglet === "chambres" && <TableauEtudiant allerReservations={() => setOnglet("reservations")} />}
        {onglet === "reservations" && <ReservationsEtudiant />}
      </div>
    </div>
  );
}