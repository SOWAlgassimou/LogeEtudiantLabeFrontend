import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import BarreNavigation from "../composants/BarreNavigation";
import { useAuth } from "../context/AuthContext";

function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);
      const { token, user } = res;
      authLogin(token, user);
      if (user?.role === "proprietaire") navigate("/proprietaire");
      else if (user?.role === "etudiant") navigate("/etudiant");
      else navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Email ou mot de passe incorrect !");
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
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
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
          <label className="block mb-6">
            Mot de passe :
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </label>
          {error && <p className="text-red-500">{error}</p>}
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