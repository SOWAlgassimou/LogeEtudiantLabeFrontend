import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BarreNavigation from "../composants/BarreNavigation";
import { getChambreById } from "../api/chambres";
import { createReservation } from "../api/reservations";

function DetailChambre() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chambre, setChambre] = useState(null);

  useEffect(() => {
    let ignore = false;
    getChambreById(id)
      .then((data) => {
        if (!ignore) setChambre(data);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, [id]);

  const reserverChambre = async () => {
    try {
      await createReservation({ chambreId: id });
      alert("✅ Chambre réservée avec succès !");
      navigate("/etudiant");
    } catch (e) {
      alert(e?.response?.data?.message || "Impossible de réserver cette chambre.");
    }
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
        {/* Statut optionnel si fourni par l'API */}
        {typeof chambre.disponible !== 'undefined' && (
          <p>
            <strong>Statut :</strong>{" "}
            {chambre.disponible ? (
              <span className="text-green-600">Disponible</span>
            ) : (
              <span className="text-red-600">Réservée</span>
            )}
          </p>
        )}

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