import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BarreNavigation from "../composants/BarreNavigation";

function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState("etudiant");
  const navigate = useNavigate();

  const gererInscription = (e) => {
    e.preventDefault();

    const nouveauxUtilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

    const existe = nouveauxUtilisateurs.find((u) => u.email === email);
    if (existe) {
      alert("❌ Cet email est déjà utilisé.");
      return;
    }

    const nouvelUtilisateur = { nom, email, motDePasse, role };
    const maj = [...nouveauxUtilisateurs, nouvelUtilisateur];

    localStorage.setItem("utilisateurs", JSON.stringify(maj));
    localStorage.setItem("utilisateurConnecte", JSON.stringify(nouvelUtilisateur));

    navigate(role === "etudiant" ? "/etudiant" : "/proprietaire");
  };

  return (
    <div>
      <BarreNavigation />
      <main className="flex justify-center items-center min-h-screen bg-gray-50">
        <form
          onSubmit={gererInscription}
          className="bg-white shadow-md p-8 rounded-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>

          <label className="block mb-3">
            Nom complet :
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </label>

          <label className="block mb-3">
            Email :
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </label>

          <label className="block mb-3">
            Mot de passe :
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </label>

          <label className="block mb-4">
            Rôle :
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border px-3 py-2 mt-1 rounded"
            >
              <option value="etudiant">Étudiant</option>
              <option value="proprietaire">Propriétaire</option>
            </select>
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            S'inscrire
          </button>
        </form>
      </main>
    </div>
  );
}

export default Inscription;