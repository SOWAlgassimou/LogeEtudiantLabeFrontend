import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BarreNavigation from "../composants/BarreNavigation";
import { register } from "../api/auth";

function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("etudiant");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ nom, email, password, role });
      setSuccess("Inscription réussie ! Vérifiez votre email.");
      setTimeout(() => navigate("/connexion"), 2000);
    } catch (err) {
      setError("Erreur lors de l'inscription. Email déjà utilisé ?");
    }
  };

  return (
    <div>
      <BarreNavigation />
      <main className="flex justify-center items-center min-h-screen bg-gray-50">
        <form
          onSubmit={handleSubmit}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

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