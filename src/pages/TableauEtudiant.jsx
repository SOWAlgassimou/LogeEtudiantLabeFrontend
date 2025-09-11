import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChambres } from "../api/chambres";

import { createReservation } from "../api/reservations";

function TableauEtudiant() {
  const [chambres, setChambres] = useState([]);

  const [chambreSelectionnee, setChambreSelectionnee] = useState(null);
  const [error, setError] = useState("");
  const getUtilisateur = () => {
    try {
      const data = localStorage.getItem("utilisateurConnecte");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };
  const utilisateur = getUtilisateur();

  const loadChambres = () => {
    getChambres()
      .then(data => {
        setChambres(Array.isArray(data) ? data : data?.chambres || []);
      })
      .catch(err => {
        setError("Erreur lors du chargement des chambres.");
      });
  };

  useEffect(() => {
    loadChambres();
    
    // Écouter les événements de mise à jour
    const handleUpdate = () => loadChambres();
    window.addEventListener('chambreUpdate', handleUpdate);
    
    return () => {
      window.removeEventListener('chambreUpdate', handleUpdate);
    };
  }, []);



  if (chambreSelectionnee) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <button 
          onClick={() => setChambreSelectionnee(null)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Retour aux chambres
        </button>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">
            Chambre {chambreSelectionnee.numero} – {chambreSelectionnee.bloc}
          </h2>
          {chambreSelectionnee.image && (
            <img
              src={`http://localhost:5000${chambreSelectionnee.image}`}
              alt="Photo de la chambre"
              className="w-full h-64 object-cover rounded mb-6"
            />
          )}
          <p className="mb-2">
            <strong>Prix :</strong> {chambreSelectionnee.prix.toLocaleString()} GNF / mois
          </p>
          <p className="mb-4">
            <strong>Statut :</strong> 
            <span className={chambreSelectionnee.disponible === false ? "text-red-600" : "text-green-600"}>
              {chambreSelectionnee.disponible === false ? " Réservée" : " Disponible"}
            </span>
          </p>
          {chambreSelectionnee.disponible !== false && (
            <button
              onClick={async () => {
                try {
                  await createReservation({ chambre: chambreSelectionnee._id });
                  alert("✅ Chambre réservée avec succès !");
                  
                  // Notification au propriétaire de la chambre
                  if (chambreSelectionnee.proprietaire?._id) {
                    const notifKey = `notifications_${chambreSelectionnee.proprietaire._id}`;
                    const existingNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
                    const newNotif = {
                      _id: Date.now().toString(),
                      titre: "Nouvelle réservation",
                      contenu: `${utilisateur?.nom || 'Un étudiant'} a réservé votre chambre ${chambreSelectionnee.numero}`,
                      type: "reservation",
                      createdAt: new Date().toISOString(),
                      lu: false
                    };
                    existingNotifs.unshift(newNotif);
                    localStorage.setItem(notifKey, JSON.stringify(existingNotifs));
                    console.log('Notification réservation créée pour:', chambreSelectionnee.proprietaire._id, newNotif);
                  }
                  
                  // Déclencher un événement pour recharger les notifications
                  window.dispatchEvent(new CustomEvent('notificationUpdate'));
                  
                  // Recharger immédiatement les réservations
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('reservationUpdate'));
                    window.dispatchEvent(new CustomEvent('chambreUpdate'));
                  }, 1000);
                  
                  setChambreSelectionnee(null);
                } catch (e) {
                  alert(e?.response?.data?.message || "Impossible de réserver cette chambre.");
                }
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            >
              Réserver
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Chambres disponibles</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {chambres.filter(ch => ch.disponible !== false).length === 0 ? (
          <p>Aucune chambre disponible pour le moment.</p>
        ) : (
          chambres.filter(ch => ch.disponible !== false).map((ch) => (
            <div
              key={ch._id}
              className="relative border rounded p-4 shadow hover:shadow-lg bg-white"
            >
              <h3 className="text-lg font-semibold">
                {ch.numero} – {ch.bloc}
              </h3>
              <p>Prix : {ch.prix.toLocaleString()} GNF / mois</p>
              <p className={ch.disponible === false ? "text-red-600" : "text-green-600"}>
                Statut : {ch.disponible === false ? "Réservée" : "Disponible"}
              </p>

              <div className="mt-3">
                <button
                  onClick={() => setChambreSelectionnee(ch)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Voir les détails
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TableauEtudiant;

