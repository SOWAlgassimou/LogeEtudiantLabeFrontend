import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import BarreNavigation from "../composants/BarreNavigation";
import { useAuth } from "../context/AuthContext";

function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      const { token, user } = res;
      authLogin(token, user);
      if (user?.role === "admin") navigate("/admin");
      else if (user?.role === "proprietaire") navigate("/proprietaire");
      else if (user?.role === "etudiant") navigate("/etudiant");
      else navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Email ou mot de passe incorrect !");
    } finally {
      setLoading(false);
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
              onChange={(e) => {setEmail(e.target.value); setErrors({...errors, email: ""})}}
              required
              className={`w-full border px-3 py-2 mt-1 rounded focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </label>
          <label className="block mb-6">
            Mot de passe :
            <input
              type="password"
              value={password}
              onChange={(e) => {setPassword(e.target.value); setErrors({...errors, password: ""})}}
              required
              className={`w-full border px-3 py-2 mt-1 rounded focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </label>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded w-full text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Connexion...
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Connexion;