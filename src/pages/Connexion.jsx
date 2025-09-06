import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import BarreNavigation from "../composants/BarreNavigation";

function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("utilisateurConnecte", JSON.stringify(user));
      // Redirige selon le rôle
      if (user.role === "proprietaire") navigate("/proprietaire");
      else navigate("/etudiant");
    } catch (err) {
      setError("Email ou mot de passe incorrect !", err);
    }
  };

  return (
    <div>
      <BarreNavigation />
      <main className="flex justify-center items-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md p-8 rounded-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <label className="block mb-2">
            Email :
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </label>

          <label className="block mb-4">
            Mot de passe :
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>
      </main>
    </div>
  );
}

export default Connexion;