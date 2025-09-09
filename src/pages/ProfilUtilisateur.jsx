import { useState, useEffect } from "react";
import BarreNavigation from "../composants/BarreNavigation";
import { useAuth } from "../context/AuthContext";
import { getUserById, updateUser } from "../api/users";

function ProfilUtilisateur() {
  const [utilisateur, setUtilisateur] = useState({});
  const [edition, setEdition] = useState(false);
  const [formulaire, setFormulaire] = useState({ nom: "", email: "", image: "" });
  const [message, setMessage] = useState("");
  const { user, setUser, logout } = useAuth();

  useEffect(() => {
    let ignore = false;
    if (!user?._id) return;
    getUserById(user._id)
      .then((data) => {
        if (ignore) return;
        setUtilisateur(data);
        setFormulaire({ nom: data.nom || "", email: data.email || "", image: data.image || "" });
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, [user?._id]);

  const handleImageChange = (e) => {
    const fichier = e.target.files[0];
    if (fichier) {
      setFormulaire({ ...formulaire, image: fichier });
    }
  };

  const enregistrerModifs = async () => {
    try {
      let payload;
      if (formulaire.image instanceof File) {
        payload = new FormData();
        payload.append('nom', formulaire.nom);
        payload.append('email', formulaire.email);
        payload.append('image', formulaire.image);
      } else {
        payload = { nom: formulaire.nom, email: formulaire.email };
      }
      const updated = await updateUser(user._id, payload);
      setUtilisateur(updated);
      setUser(updated);
      setEdition(false);
      setMessage("✅ Profil mis à jour.");
      setTimeout(() => setMessage(""), 2500);
    } catch (e) {
      setMessage(e?.response?.data?.message || "❌ Erreur lors de la mise à jour du profil.");
      setTimeout(() => setMessage(""), 3500);
    }
  };

  return (
    <div>
      <BarreNavigation />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center bg-white shadow-lg rounded-lg p-8">
          {/* Photo de profil */}
          <img
            src={formulaire.image || "/logo-profil.png"}
            alt="Profil"
            className="w-24 h-24 object-cover rounded-full mb-4 border-4 border-blue-200"
          />

          {/* Titre */}
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Mon Profil</h2>

          {message && <div className="mb-4 text-center font-semibold">{message}</div>}
          {/* Formulaire ou affichage */}
          {edition ? (
            <div className="w-full space-y-4 text-gray-800 text-lg">
              <div>
                <label className="block font-semibold">Nom :</label>
                <input
                  type="text"
                  value={formulaire.nom}
                  onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold">Email :</label>
                <input
                  type="email"
                  value={formulaire.email}
                  onChange={(e) => setFormulaire({ ...formulaire, email: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold">Photo de profil :</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>
              <button
                onClick={enregistrerModifs}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3 text-gray-800 text-lg">
              <p><strong>Nom :</strong> {utilisateur.nom}</p>
              <p><strong>Email :</strong> {utilisateur.email}</p>
              <p><strong>Rôle :</strong> {utilisateur.role === "etudiant" ? "Étudiant" : "Propriétaire"}</p>
              <button
                onClick={() => setEdition(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Modifier mes infos
              </button>
            </div>
          )}

          {/* Déconnexion */}
          <button
            onClick={logout}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow"
          >
            Se déconnecter
          </button>
        </div>
      </main>
    </div>
  );
}

export default ProfilUtilisateur;