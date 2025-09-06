import { useEffect, useState } from "react";
import BarreNavigation from "../composants/BarreNavigation";
import { getReservations } from "../api/reservations";
import jsPDF from "jspdf";

function ReservationsEtudiant() {
  const [reservations, setReservations] = useState([]);
  const utilisateur = JSON.parse(localStorage.getItem("utilisateurConnecte"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    getReservations(token).then(setReservations);
  }, []);

  const annulerReservation = (idChambre) => {
    // 1. Supprimer réservation
    const nouvellesReservations = reservations.filter((r) => r.id !== idChambre);
    const toutes = JSON.parse(localStorage.getItem("reservations")) || [];
    const majGlobales = toutes.filter((r) => r.id !== idChambre);
    localStorage.setItem("reservations", JSON.stringify(majGlobales));
    setReservations(nouvellesReservations);

    // 2. Remettre chambre à dispo
    const chambres = JSON.parse(localStorage.getItem("chambres")) || [];
    const misesAJour = chambres.map((ch) =>
      ch.id === idChambre ? { ...ch, disponible: true } : ch
    );
    localStorage.setItem("chambres", JSON.stringify(misesAJour));
  };

  const telechargerRecu = (reservation) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reçu de réservation – Plateforme Logement", 20, 20);
    doc.text(`Nom : ${utilisateur.nom}`, 20, 40);
    doc.text(`Email : ${utilisateur.email}`, 20, 50);
    doc.text(`Chambre : ${reservation.numero} – ${reservation.bloc}`, 20, 60);
    doc.text(
      `Prix : ${reservation.prix.toLocaleString()} GNF / mois`,
      20,
      70
    );
    doc.text(
      `Date : ${new Date(reservation.date).toLocaleDateString()}`,
      20,
      80
    );

    doc.text("Merci d'avoir utilisé notre plateforme 🙏", 20, 100);
    doc.save(`recu-${reservation.numero}-${reservation.bloc}.pdf`);
  };

  return (
    <div>
      <BarreNavigation />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Mes Réservations</h2>

        {reservations.length === 0 ? (
          <p>Aucune chambre réservée pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {reservations.map((r, i) => (
              <li
                key={i}
                className="bg-white p-4 rounded shadow flex flex-col sm:flex-row sm:items-start gap-4"
               >
                {/* Infos à gauche */}
                <div className="flex-1">
                  <p><strong>Bloc :</strong> {r.bloc} — <strong>Chambre :</strong> {r.numero}</p>
                  <p><strong>Prix :</strong> {r.prix.toLocaleString()} GNF / mois</p>
                  <p><strong>Date :</strong> {new Date(r.date).toLocaleDateString()}</p>
                  <p><strong>Email :</strong> {r.email}</p>
                  <div className="mt-3 space-x-2">
                    <button
                      onClick={() => telechargerRecu(r)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Reçu PDF
                    </button>
                    <button
                      onClick={() => annulerReservation(r.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >  
                     Annuler
                    </button>
                  </div>
                </div>

                {/* Image à droite */}
                {r.image && (
                  <div className="w-full sm:w-40 shrink-0">
                    <img
                      src={r.image}
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