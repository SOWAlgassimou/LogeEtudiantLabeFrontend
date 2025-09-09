import { useState, useEffect } from "react";
import { createChambre, getChambres, deleteChambre } from "../api/chambres"; // Ajout deleteChambre
import { getOwnerReservations, validateOwnerReservation } from "../api/reservations";

function TableauProprietaire({ onglet }) {
  const [chambres, setChambres] = useState([]);
  const [formulaire, setFormulaire] = useState({ bloc: "", numero: "", prix: "", image: "" });
  const [message, setMessage] = useState("");
  const [modeEdition, setModeEdition] = useState(false);
  const [chambreEnCours, setChambreEnCours] = useState(null);
  const [messageAction, setMessageAction] = useState("");
  const [reservationsProprio, setReservationsProprio] = useState([]);

  const utilisateur = JSON.parse(localStorage.getItem("utilisateurConnecte"));

  const convertirImage = (e) => {
    const fichier = e.target.files[0];
    if (fichier) {
      setFormulaire({ ...formulaire, image: fichier });
    }
  };

  // Charger les chambres et réservations depuis l'API selon l'onglet actif
    useEffect(() => {
    if (onglet === "liste") {
      getChambres()
        .then((data) => setChambres(Array.isArray(data) ? data : []))
        .catch(() => setMessage("Erreur lors du chargement des chambres."));
    }
    if (onglet === "reservations") {
      getOwnerReservations()
        .then((data) => setReservationsProprio(Array.isArray(data) ? data : []))
        .catch(() => setMessage("Erreur lors du chargement des réservations."));
    }
  }, [onglet]);

  const resetFormulaire = () => {
    setFormulaire({ bloc: "", numero: "", prix: "" });
    setModeEdition(false);
    setChambreEnCours(null);
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    const bloc = formulaire.bloc.trim();
    const numero = formulaire.numero.trim();
    const prix = parseInt(formulaire.prix, 10);

    if (!bloc || !numero || isNaN(prix)) {
      setMessage("❌ Remplis tous les champs correctement.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!utilisateur?._id) {
      setMessage("❌ Impossible d’identifier le propriétaire.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Vérifie que chambres est bien un tableau avant d'utiliser find
    if (!Array.isArray(chambres)) {
      setMessage("Erreur interne : liste des chambres invalide.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Vérifie si la chambre existe déjà (doublon)
    const doublon = chambres.find(
      (ch) =>
        ch.bloc.toLowerCase() === bloc.toLowerCase() &&
        ch.numero.toLowerCase() === numero.toLowerCase() &&
        (!modeEdition || ch._id !== chambreEnCours?._id)
    );
    if (doublon) {
      setMessage("❌ Cette chambre existe déjà.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('bloc', bloc);
      formData.append('numero', numero);
      formData.append('prix', String(prix));
      formData.append('proprietaire', utilisateur._id);
      if (formulaire.image instanceof File) {
        formData.append('image', formulaire.image);
      }
      await createChambre(formData);
      // Recharge la liste depuis l'API
      getChambres().then((data) => setChambres(Array.isArray(data) ? data : []));
      setMessage("✅ Chambre ajoutée.");
    } catch (err) {
      setMessage("❌ Erreur lors de l'ajout : " + (err?.response?.data?.error || err.message));
    }

    resetFormulaire();
    setTimeout(() => setMessage(""), 3000);
  };

  const modifierChambre = (ch) => {
    setFormulaire({ bloc: ch.bloc, numero: ch.numero, prix: ch.prix });
    setModeEdition(true);
    setChambreEnCours(ch);
  };

  const supprimerChambre = async (id) => {
    try {
      await deleteChambre(id);
      getChambres().then((data) => setChambres(Array.isArray(data) ? data : []));
      setMessage("✅ Chambre supprimée.");
    } catch {
      setMessage("❌ Erreur lors de la suppression.");
    }
    setTimeout(() => setMessage(""), 3000);
    if (modeEdition && chambreEnCours?._id === id) {
      resetFormulaire();
    }
  };

  // Confirmer une réservation (API propriétaire)
  async function confirmerReservation(id) {
    try {
      await validateOwnerReservation(id);
      setMessageAction("✅ Réservation confirmée !");
      const data = await getOwnerReservations();
      setReservationsProprio(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessageAction("❌ Erreur lors de la confirmation.");
    }
    setTimeout(() => setMessageAction(""), 2500);
  }

  // Suppression d'une réservation côté propriétaire (si API disponible)
  function supprimerReservation(id) {
    setMessageAction("Fonction de suppression non disponible.");
    setTimeout(() => setMessageAction(""), 2500);
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Gestion des chambres</h2>

      {/* Onglet 1 : Formulaire */}
      {onglet === "formulaire" && (
        <form onSubmit={gererSoumission} className="mb-6 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">
            {modeEdition ? "Modifier une chambre" : "Ajouter une chambre"}
          </h3>
          {message && <p className="mb-3 text-sm text-green-700">{message}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Bloc (ex: Bloc A)"
              value={formulaire.bloc}
              onChange={(e) => setFormulaire({ ...formulaire, bloc: e.target.value })}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Numéro (ex: C1)"
              value={formulaire.numero}
              onChange={(e) => setFormulaire({ ...formulaire, numero: e.target.value })}
              required
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Prix en GNF" 
              value={formulaire.prix}
              onChange={(e) => setFormulaire({ ...formulaire, prix: e.target.value })}
              required
              className="border p-2 rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => convertirImage(e)}
              className="border p-2 rounded"
            />
          </div>
          <div className="mt-4 flex gap-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              {modeEdition ? "Modifier" : "Ajouter"}
            </button>
            {modeEdition && (
              <button
                type="button"
                onClick={resetFormulaire}
                className="text-gray-600 hover:underline"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      )}

      {/* Onglet 2 : Liste des chambres */}
      {onglet === "liste" && (
        <ul className="space-y-2">
          {chambres.map((ch) => (
            <li
              key={ch._id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <span>
                {ch.bloc} – {ch.numero} | {ch.prix.toLocaleString()} GNF
              </span>
              <div className="space-x-2">
                <button onClick={() => modifierChambre(ch)} className="text-blue-600 hover:underline">
                  Modifier
                </button>
                <button onClick={() => supprimerChambre(ch._id)} className="text-red-600 hover:underline">
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Onglet 3 : Réservations reçues */}
      {onglet === "reservations" && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Réservations reçues</h3>
          {messageAction && (
            <div className="mb-4 text-green-700 font-semibold text-center">{messageAction}</div>
          )}
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {reservationsProprio.map((r, i) => (
              <li key={r._id || i} className="border rounded p-4 shadow hover:shadow-lg bg-white" style={{minHeight: "150px"}}>
                <p><strong>Étudiant :</strong> {r.user?.nom || r.etudiant?.nom || "-"}</p>
                <p><strong>Email :</strong> {r.user?.email || r.etudiant?.email || "-"}</p>
                <p><strong>Chambre :</strong> {r.chambre?.numero} – {r.chambre?.bloc}</p>
                <p><strong>Prix :</strong> {Number(r.chambre?.prix ?? r.prix ?? 0).toLocaleString()} GNF</p>
                <p><strong>Réservée le :</strong> {new Date(r.createdAt || r.date).toLocaleDateString()}</p>
                <p>
                  <strong>Statut :</strong>{" "}
                  <span className={(r.statut || r.status) === "confirmée" ? "text-green-600" : "text-orange-600"}>
                    {r.statut || r.status || "en attente"}
                  </span>
                </p>
                {r.chambre?.image && (
                  <img
                    src={r.chambre.image}
                    alt={`Chambre ${r.chambre?.numero || ""}`}
                    style={{
                      marginTop: "10px",
                      width: "130px",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    }}
                  />
                )}

                {/* Boutons d'action dans la liste */}
                <div className="mt-4 flex gap-2">
                  {(r.statut || r.status) !== "confirmée" && (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => confirmerReservation(r._id)}
                    >
                      Confirmer
                    </button>
                  )}
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => supprimerReservation(r._id)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>

          
        </div>
      )}
    </div>
  );
}

export default TableauProprietaire;