import { useState, useEffect } from "react";
import BarreNavigation from "../composants/BarreNavigation";

function ProfilUtilisateur() {
  const [utilisateur, setUtilisateur] = useState({});
  const [edition, setEdition] = useState(false);
  const [formulaire, setFormulaire] = useState({ nom: "", email: "", image: "" });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utilisateurConnecte"));
    setUtilisateur(u);
    setFormulaire({ nom: u.nom, email: u.email, image: u.image || "" });
  }, []);

  const handleImageChange = (e) => {
    const fichier = e.target.files[0];
    const lecteur = new FileReader();
    lecteur.onloadend = () => {
      console.log("Image chargée :", lecteur.result); // ✅ test
      setFormulaire({ ...formulaire, image: lecteur.result });
    };
    if (fichier) lecteur.readAsDataURL(fichier);
  };

  const enregistrerModifs = () => {
    console.log("Enregistrement en cours..."); // ✅ test
    const nouveaux = { ...utilisateur, ...formulaire };
    setUtilisateur(nouveaux);
    localStorage.setItem("utilisateurConnecte", JSON.stringify(nouveaux));

    // Mettre à jour dans la liste globale des utilisateurs
    const tous = JSON.parse(localStorage.getItem("utilisateurs")) || [];
    const maj = tous.map((u) =>
      u.email === utilisateur.email ? { ...u, ...formulaire } : u
    );
    localStorage.setItem("utilisateurs", JSON.stringify(maj));

    setEdition(false);

    // Mettre à jour les réservations liées à cet utilisateur
      const toutesReservations = JSON.parse(localStorage.getItem("reservations")) || [];
      const majReservations = toutesReservations.map((r) =>
        r.email === utilisateur.email
      ? { ...r, nom: formulaire.nom, email: formulaire.email, photoProfil: formulaire.image }
      : r
    );
    localStorage.setItem("reservations", JSON.stringify(majReservations));
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
            onClick={() => {
              localStorage.removeItem("utilisateurConnecte");
              window.location.href = "/connexion";
            }}
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