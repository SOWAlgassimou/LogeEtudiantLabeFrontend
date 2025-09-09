import { useEffect, useState } from "react";
import BarreNavigation from "../composants/BarreNavigation";
import { getReservations, deleteReservation as apiDeleteReservation } from "../api/reservations";
import jsPDF from "jspdf";

function ReservationsEtudiant() {
  const [reservations, setReservations] = useState([]);
  const utilisateur = JSON.parse(localStorage.getItem("utilisateurConnecte"));

  useEffect(() => {
    // Filtrer par utilisateur connecté
    const params = utilisateur?._id ? { user: utilisateur._id } : {};
    getReservations(params).then((data) => {
      console.log("Utilisateur connecté ID:", utilisateur?._id);
      console.log("Données réservations reçues:", data);
      const reservationsList = data?.reservations || data || [];
      // Filtrer côté client si nécessaire
      const mesReservations = reservationsList.filter(r => 
        r.etudiant?._id === utilisateur?._id || r.etudiant === utilisateur?._id || 
        r.user?._id === utilisateur?._id || r.user === utilisateur?._id
      );
      console.log("Mes réservations filtrées:", mesReservations);
      console.log("Statuts des réservations:", mesReservations.map(r => r.statut));
      setReservations(Array.isArray(mesReservations) ? mesReservations : []);
    });
  }, []);

  const annulerReservation = async (reservationId) => {
    try {
      await apiDeleteReservation(reservationId);
      setReservations((prev) => prev.filter((r) => (r._id || r.id) !== reservationId));
    } catch (_) {
      // Optionnel: afficher un message d'erreur
    }
  };

  const telechargerRecu = (reservation) => {
    const doc = new jsPDF();
    const chambre = reservation.chambre || {};
    const numero = reservation.numero || chambre.numero || "";
    const bloc = reservation.bloc || chambre.bloc || "";
    const prixVal = reservation.prix ?? chambre.prix ?? 0;
    const dateVal = reservation.date || reservation.createdAt || Date.now();
    const emailVal = reservation.email || utilisateur?.email || (reservation.user && reservation.user.email) || "";

    doc.setFontSize(14);
    doc.text("Reçu de réservation – Plateforme Logement", 20, 20);
    doc.text(`Nom : ${utilisateur.nom}`, 20, 40);
    doc.text(`Email : ${emailVal}`, 20, 50);
    doc.text(`Chambre : ${numero} – ${bloc}`, 20, 60);
    doc.text(`Prix : ${Number(prixVal).toLocaleString()} GNF / mois`, 20, 70);
    doc.text(`Date : ${new Date(dateVal).toLocaleDateString()}`, 20, 80);

    doc.text("Merci d'avoir utilisé notre plateforme 🙏", 20, 100);
    doc.save(`recu-${numero}-${bloc}.pdf`);
  };

  return (
    <div>
      <BarreNavigation />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Mes Réservations</h2>

        {reservations.filter(r => r.statut !== "annulée" && r.statut !== "annulée").length === 0 ? (
          <p>Aucune chambre réservée pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {reservations.filter(r => r.statut !== "annulée" && r.statut !== "annulée").map((r, i) => (
              <li
                key={r._id || r.id || i}
                className="bg-white p-4 rounded shadow flex flex-col sm:flex-row sm:items-start gap-4"
               >
                {/* Infos à gauche */}
                <div className="flex-1">
                  <p><strong>Bloc :</strong> {r.chambre?.bloc || r.bloc} — <strong>Chambre :</strong> {r.chambre?.numero || r.numero}</p>
                  <p><strong>Prix :</strong> {Number(r.chambre?.prix || r.prix || 0).toLocaleString()} GNF / mois</p>
                  <p><strong>Date :</strong> {new Date(r.createdAt || r.date).toLocaleDateString()}</p>
                  <p><strong>Email :</strong> {r.user?.email || r.email || utilisateur?.email}</p>
                  <div className="mt-3 space-x-2">
                    <button
                      onClick={() => telechargerRecu(r)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Reçu PDF
                    </button>
                    <button
                      onClick={() => annulerReservation(r._id || r.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >  
                     Annuler
                    </button>
                  </div>
                </div>

                {/* Image à droite */}
                {(r.chambre?.image || r.image) && (
                  <div className="w-full sm:w-40 shrink-0">
                    <img
                      src={r.chambre?.image || r.image}
                      alt="Chambre"
                      className="w-full h-28 object-cover rounded"
                      style={{ maxHeight: "130px" }}
                    />
                  </div>
               )}
             </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default ReservationsEtudiant;