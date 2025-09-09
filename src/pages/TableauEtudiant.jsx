import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChambres } from "../api/chambres";

function TableauEtudiant() {
  const [chambres, setChambres] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getChambres()
      .then(setChambres)
      .catch(() => setError("Erreur lors du chargement des chambres."));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Chambres disponibles</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {chambres.length === 0 ? (
          <p>Aucune chambre disponible pour le moment.</p>
        ) : (
          chambres.map((ch) => (
            <div
              key={ch._id}
              className="relative border rounded p-4 shadow hover:shadow-lg bg-white"
            >
              <h3 className="text-lg font-semibold">
                {ch.numero} – {ch.bloc}
              </h3>
              <p>Prix : {ch.prix.toLocaleString()} GNF / mois</p>
              <p className="text-green-600">Statut : Disponible</p>
              {ch.image && (
                <img
                  src={ch.image}
                  alt={`Chambre ${ch.numero}`}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "200px",
                    maxWidth: "40%",
                    height: "auto",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    margin: "10px",
                  }}
                />
              )}
              <Link
                to={`/chambre/${ch._id}`}
                className="mt-3 inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Voir les détails
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TableauEtudiant;

