import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BarreNavigation from "../composants/BarreNavigation";

function DetailChambre() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chambre, setChambre] = useState(null);
  const utilisateur = JSON.parse(localStorage.getItem("utilisateurConnecte"));

  useEffect(() => {
    const chambres = JSON.parse(localStorage.getItem("chambres")) || [];
    const trouvée = chambres.find((ch) => ch.id.toString() === id);
    setChambre(trouvée);
  }, [id]);

  const reserverChambre = () => {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    const dejaReserve = reservations.some((r) => r.email === utilisateur?.email);

    if (dejaReserve) {
      alert("❌ Vous avez déjà une réservation en cours.");
      return;
    }

    // 1. Mettre à jour l’état de la chambre
    const chambres = JSON.parse(localStorage.getItem("chambres")) || [];
    const misesAJour = chambres.map((ch) =>
      ch.id.toString() === id ? { ...ch, disponible: false } : ch
    );
    localStorage.setItem("chambres", JSON.stringify(misesAJour));

    // 2. Enregistrer la réservation
    const nouvelleReservation = {
      ...chambre,
      date: new Date(),
      email: utilisateur?.email,
      nom: utilisateur?.nom,
      photoProfil: utilisateur?.image || "", // ✅ nouvelle propriété pour la photo de l'étudiant
    };
    const nouvelles = [...reservations, nouvelleReservation];
    localStorage.setItem("reservations", JSON.stringify(nouvelles));

    alert("✅ Chambre réservée avec succès !");
    navigate("/etudiant");
  };

  if (!chambre) return <div className="p-6">Chargement...</div>;

  return (
    <div>
      <BarreNavigation />
      {chambre.image && (
         <img
           src={chambre.image}
           alt="Photo de la chambre"
           className="w-full h-64 object-cover rounded mb-6"
         />
      )}
      <main className="max-w-3xl mx-auto px-6 py-10 bg-white shadow rounded mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Chambre {chambre.numero} – {chambre.bloc}
        </h2>
        <p>{chambre.description}</p>
        <p className="mt-2">
          <strong>Prix :</strong> {chambre.prix.toLocaleString()} GNF / mois
        </p>
        <p>
          <strong>Statut :</strong>{" "}
          {chambre.disponible ? (
            <span className="text-green-600">Disponible</span>
          ) : (
            <span className="text-red-600">Réservée</span>
          )}
        </p>

        {chambre.equipements && (
          <ul className="mt-2 list-disc list-inside text-gray-700">
            {chambre.equipements.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}

        {chambre.disponible && (
          <button
            onClick={reserverChambre}
            className="mt-6 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Réserver
          </button>
        )}
      </main>
    </div>
  );
}

export default DetailChambre;