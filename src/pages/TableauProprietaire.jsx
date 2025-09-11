import { useState, useEffect } from "react";
import { createChambre, getChambres, deleteChambre, updateChambre } from "../api/chambres";
import { getOwnerReservations, validateOwnerReservation } from "../api/reservations";

function TableauProprietaire({ onglet, onSwitchToForm }) {
  const [chambres, setChambres] = useState([]);
  const [formulaire, setFormulaire] = useState({ bloc: "", numero: "", prix: "", image: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [chambreEnCours, setChambreEnCours] = useState(null);
  const [messageAction, setMessageAction] = useState("");
  const [reservationsProprio, setReservationsProprio] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [chambreSelectionnee, setChambreSelectionnee] = useState(null);

  const getUtilisateur = () => {
    try {
      const data = localStorage.getItem("utilisateurConnecte");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };
  const utilisateur = getUtilisateur();

  const convertirImage = (e) => {
    const fichier = e.target.files[0];
    if (fichier) {
      // Validation du fichier
      if (fichier.size > 5 * 1024 * 1024) {
        setMessage("❌ Image trop volumineuse (max 5MB)");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      if (!fichier.type.startsWith('image/')) {
        setMessage("❌ Veuillez sélectionner une image valide");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      
      setFormulaire({ ...formulaire, image: fichier });
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(fichier);
    }
  };

  // Charger les chambres et réservations depuis l'API selon l'onglet actif
    useEffect(() => {
    if (onglet === "liste") {
      getChambres()
        .then((data) => {
          const allChambres = Array.isArray(data) ? data : data?.chambres || [];
          // Filtrer seulement les chambres du propriétaire connecté
          const mesChambres = allChambres.filter(ch => 
            ch.proprietaire?._id === utilisateur?._id || ch.proprietaire === utilisateur?._id
          );
          setChambres(mesChambres);
        })
        .catch(err => {
          setMessage("Erreur lors du chargement des chambres.");
        });
    }
    if (onglet === "reservations") {
      getOwnerReservations()
        .then((data) => {
          console.log("Réservations propriétaire reçues:", data);
          const reservationsList = data?.reservations || data || [];
          setReservationsProprio(Array.isArray(reservationsList) ? reservationsList : []);
        })
        .catch(() => setMessage("Erreur lors du chargement des réservations."));
    }
  }, [onglet]);

  const resetFormulaire = () => {
    setFormulaire({ bloc: "", numero: "", prix: "", image: "" });
    setImagePreview(null);
    setModeEdition(false);
    setChambreEnCours(null);
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      if (modeEdition && chambreEnCours?._id) {
        // Mode modification - utiliser JSON si pas de nouvelle image
        if (formulaire.image instanceof File) {
          const formData = new FormData();
          formData.append('bloc', bloc);
          formData.append('numero', numero);
          formData.append('prix', String(prix));
          formData.append('image', formulaire.image);
          await updateChambre(chambreEnCours._id, formData);
        } else {
          // Pas de nouvelle image, envoyer en JSON
          const payload = {
            bloc,
            numero,
            prix
          };
          await updateChambre(chambreEnCours._id, payload);
        }
        setMessage("✅ Chambre modifiée.");
      } else {
        // Mode ajout - toujours FormData
        const formData = new FormData();
        formData.append('bloc', bloc);
        formData.append('numero', numero);
        formData.append('prix', String(prix));
        formData.append('proprietaire', utilisateur._id);
        if (formulaire.image instanceof File) {
          formData.append('image', formulaire.image);
        }
        await createChambre(formData);
        setMessage("✅ Chambre ajoutée.");
      }
      
      // Recharge la liste depuis l'API
      getChambres().then((data) => {
        const allChambres = Array.isArray(data) ? data : data?.chambres || [];
        const mesChambres = allChambres.filter(ch => 
          ch.proprietaire?._id === utilisateur?._id || ch.proprietaire === utilisateur?._id
        );
        setChambres(mesChambres);
      });
    } catch (err) {
      const action = modeEdition ? "modification" : "ajout";
      setMessage(`❌ Erreur lors de la ${action} : ` + (err?.response?.data?.error || err.message));
    }

    resetFormulaire();
    setTimeout(() => setMessage(""), 3000);
    setLoading(false);
  };

  const modifierChambre = (ch) => {
    setFormulaire({ bloc: ch.bloc, numero: ch.numero, prix: ch.prix, image: "" });
    setModeEdition(true);
    setChambreEnCours(ch);
    // Basculer vers l'onglet formulaire pour voir la modification
    if (onSwitchToForm) {
      onSwitchToForm();
    }
  };

  const supprimerChambre = async (id) => {
    try {
      console.log("Suppression de la chambre ID:", id);
      await deleteChambre(id);
      console.log("Chambre supprimée avec succès");
      getChambres().then((data) => {
        const allChambres = Array.isArray(data) ? data : data?.chambres || [];
        const mesChambres = allChambres.filter(ch => 
          ch.proprietaire?._id === utilisateur?._id || ch.proprietaire === utilisateur?._id
        );
        setChambres(mesChambres);
      });
      setMessage("✅ Chambre supprimée.");
    } catch (error) {
      console.error("Erreur suppression:", error);
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
      await validateOwnerReservation(id, { statut: "confirmée" });
      setMessageAction("✅ Réservation confirmée !");
      const data = await getOwnerReservations();
      const reservationsList = data?.reservations || data || [];
      setReservationsProprio(Array.isArray(reservationsList) ? reservationsList : []);
    } catch (e) {
      console.error("Erreur confirmation:", e);
      setMessageAction("❌ Erreur lors de la confirmation.");
    }
    setTimeout(() => setMessageAction(""), 2500);
  }

  // Suppression d'une réservation côté propriétaire
  async function supprimerReservation(id) {
    try {
      // Trouver la réservation avant suppression pour récupérer l'ID de la chambre
      const reservation = reservationsProprio.find(r => r._id === id);
      const chambreId = reservation?.chambre?._id;
      
      await validateOwnerReservation(id, { statut: "annulée" });
      
      // Remettre la chambre disponible si on a l'ID
      if (chambreId) {
        try {
          await updateChambre(chambreId, { disponible: true });
        } catch (err) {
          console.log('Erreur mise à jour chambre:', err);
        }
      }
      
      setMessageAction("✅ Réservation supprimée !");
      // Supprimer immédiatement de la liste locale
      setReservationsProprio(prev => prev.filter(r => r._id !== id));
      // Déclencher les événements de mise à jour
      window.dispatchEvent(new CustomEvent('chambreUpdate'));
      window.dispatchEvent(new CustomEvent('reservationUpdate'));
    } catch (e) {
      console.error("Erreur suppression:", e);
      setMessageAction("❌ Erreur lors de la suppression.");
    }
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
          {message && (
            <div className={`mb-3 p-3 rounded ${
              message.includes('❌') ? 'bg-red-100 text-red-700 border border-red-300' : 
              'bg-green-100 text-green-700 border border-green-300'
            }`}>
              {message}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Bloc (ex: Bloc A)"
                value={formulaire.bloc}
                onChange={(e) => setFormulaire({ ...formulaire, bloc: e.target.value })}
                required
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formulaire.bloc && formulaire.bloc.length < 2 && (
                <p className="text-red-500 text-xs mt-1">Le bloc doit contenir au moins 2 caractères</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Numéro (ex: C1)"
                value={formulaire.numero}
                onChange={(e) => setFormulaire({ ...formulaire, numero: e.target.value })}
                required
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formulaire.numero && formulaire.numero.length < 1 && (
                <p className="text-red-500 text-xs mt-1">Le numéro est requis</p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder="Prix en GNF" 
                value={formulaire.prix}
                onChange={(e) => setFormulaire({ ...formulaire, prix: e.target.value })}
                required
                min="1000"
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formulaire.prix && parseInt(formulaire.prix) < 1000 && (
                <p className="text-red-500 text-xs mt-1">Le prix doit être d'au moins 1000 GNF</p>
              )}
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">Image de la chambre</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => convertirImage(e)}
                className="border p-2 rounded w-full"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="w-32 h-32 object-cover rounded border"
                  />
                  <button 
                    type="button"
                    onClick={() => {setImagePreview(null); setFormulaire({...formulaire, image: ""})}}
                    className="ml-2 text-red-600 text-sm hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`px-4 py-2 rounded text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  {modeEdition ? "Modification..." : "Ajout..."}
                </span>
              ) : (
                modeEdition ? "Modifier" : "Ajouter"
              )}
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
      {onglet === "liste" && !chambreSelectionnee && (
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
                <button onClick={() => setChambreSelectionnee(ch)} className="text-green-600 hover:underline">
                  Voir détail
                </button>
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

      {/* Détail d'une chambre */}
      {onglet === "liste" && chambreSelectionnee && (
        <div className="max-w-3xl mx-auto p-6">
          <button 
            onClick={() => setChambreSelectionnee(null)}
            className="mb-4 text-blue-600 hover:underline"
          >
            ← Retour à la liste
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
            <div className="space-x-2">
              <button 
                onClick={() => {
                  modifierChambre(chambreSelectionnee);
                  setChambreSelectionnee(null);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Modifier
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
                    supprimerChambre(chambreSelectionnee._id);
                    setChambreSelectionnee(null);
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
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
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
                        supprimerReservation(r._id);
                      }
                    }}
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