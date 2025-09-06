import { useState, useEffect } from "react";

function TableauProprietaire({ onglet }) {
  const [chambres, setChambres] = useState(() => {
    return JSON.parse(localStorage.getItem("chambres")) || [];
  });

  const [formulaire, setFormulaire] = useState({ bloc: "", numero: "", prix: "", image: "" });
  const [message, setMessage] = useState("");
  const [modeEdition, setModeEdition] = useState(false);
  const [chambreEnCours, setChambreEnCours] = useState(null);
  const [messageAction, setMessageAction] = useState("");
  const [reservationASupprimer, setReservationASupprimer] = useState(null);

  const convertirImage = (e) => {
    const fichier = e.target.files[0];
    const lecteur = new FileReader();
    
    lecteur.onloadend = () => {
    setFormulaire({ ...formulaire, image: lecteur.result });
    };

    if (fichier) {
    lecteur.readAsDataURL(fichier);
    }
  };
  
  useEffect(() => {
    localStorage.setItem("chambres", JSON.stringify(chambres));
  }, [chambres]);

  const resetFormulaire = () => {
    setFormulaire({ bloc: "", numero: "", prix: "" });
    setModeEdition(false);
    setChambreEnCours(null);
  };

  const gererSoumission = (e) => {
    e.preventDefault();
    const bloc = formulaire.bloc.trim();
    const numero = formulaire.numero.trim();

    const doublon = chambres.find(
      (ch) =>
        ch.bloc.toLowerCase() === bloc.toLowerCase() &&
        ch.numero.toLowerCase() === numero.toLowerCase() &&
        (!modeEdition || ch.id !== chambreEnCours.id)
    );

    if (doublon) {
      setMessage("❌ Cette chambre existe déjà.");
      return;
    }

    if (modeEdition) {
      const chambresModifiees = chambres.map((ch) =>
        ch.id === chambreEnCours.id
          ? { ...ch, ...formulaire, prix: parseInt(formulaire.prix) }
          : ch
      );
      setChambres(chambresModifiees);
      setMessage("✅ Chambre modifiée.");
    } else {
      const nouvelle = {
        id: Date.now(),
        bloc,
        numero,
        prix: parseInt(formulaire.prix),
        image: formulaire.image, // base64 string
        disponible: true,
        description: "Chambre ajoutée par un propriétaire.",
        equipements: ["Électricité 24h/24", "Eau potable"],
      };
      setChambres([...chambres, nouvelle]);
      setMessage("✅ Chambre ajoutée.");
    }

    resetFormulaire();
    setTimeout(() => setMessage(""), 3000);
  };

  const modifierChambre = (ch) => {
    setFormulaire({ bloc: ch.bloc, numero: ch.numero, prix: ch.prix });
    setModeEdition(true);
    setChambreEnCours(ch);
  };

  const supprimerChambre = (id) => {
    const maj = chambres.filter((ch) => ch.id !== id);
    setChambres(maj);
    setMessage("✅ Chambre supprimée.");
    setTimeout(() => setMessage(""), 3000);
    if (modeEdition && chambreEnCours?.id === id) {
      resetFormulaire();
    }
  };

  // Confirmer une réservation
  function confirmerReservation(id) {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    const maj = reservations.map(r =>
      r.id === id ? { ...r, statut: "confirmée" } : r
    );
    localStorage.setItem("reservations", JSON.stringify(maj));
    setMessageAction("✅ Réservation confirmée !");
    setTimeout(() => setMessageAction(""), 2500);
    // Pour rafraîchir sans reload :
    window.dispatchEvent(new Event("storage"));
  }

  // Supprimer une réservation et rendre la chambre dispo
  function supprimerReservation(id, numero, bloc) {
    // Supprimer la réservation
    const reservations = (JSON.parse(localStorage.getItem("reservations")) || []).filter(r => r.id !== id);
    localStorage.setItem("reservations", JSON.stringify(reservations));
    // Rendre la chambre disponible
    const chambres = JSON.parse(localStorage.getItem("chambres")) || [];
    const chambresMaj = chambres.map(ch =>
      ch.numero === numero && ch.bloc === bloc ? { ...ch, disponible: true } : ch
    );
    localStorage.setItem("chambres", JSON.stringify(chambresMaj));
    setMessageAction("✅ Réservation supprimée !");
    setTimeout(() => setMessageAction(""), 2500);
    setReservationASupprimer(null);
    window.dispatchEvent(new Event("storage"));
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
              key={ch.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <span>
                {ch.bloc} – {ch.numero} | {ch.prix.toLocaleString()} GNF
              </span>
              <div className="space-x-2">
                <button onClick={() => modifierChambre(ch)} className="text-blue-600 hover:underline">
                  Modifier
                </button>
                <button onClick={() => supprimerChambre(ch.id)} className="text-red-600 hover:underline">
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
            {(JSON.parse(localStorage.getItem("reservations")) || []).map((r, i) => (
              <li key={r.id || i} className="border rounded p-4 shadow hover:shadow-lg bg-white" style={{minHeight: "150px"}}>
                <p><strong>Étudiant :</strong> {r.nom}</p>
                <p><strong>Email :</strong> {r.email}</p>
                <p><strong>Chambre :</strong> {r.numero} – {r.bloc}</p>
                <p><strong>Prix :</strong> {r.prix.toLocaleString()} GNF</p>
                <p><strong>Réservée le :</strong> {new Date(r.date).toLocaleDateString()}</p>
                <p>
                  <strong>Statut :</strong>{" "}
                  <span className={r.statut === "confirmée" ? "text-green-600" : "text-orange-600"}>
                    {r.statut || "en attente"}
                  </span>
                </p>
                {r.image && (
                  <img
                    src={r.image}
                    alt={`Chambre ${r.numero}`}
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
                {/* ✅ Photo de l'étudiant à droite */}
                {r.image && (
                    <img
                      src={r.photoProfil } 
                      alt="Étudiant"
                      style={{
                        float: "right",
                        marginTop: "10px",
                        width: "130px",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                      }}
                   />
                )}

                {/* Boutons d'action dans la liste */}
                <div className="mt-4 flex gap-2">
                  {r.statut !== "confirmée" && (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => confirmerReservation(r.id)}
                    >
                      Confirmer
                    </button>
                  )}
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => supprimerReservation(r.id, r.numero, r.bloc)}
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