import { Link } from "react-router-dom";


function MenuLateral({ role }) {
  return (
    <aside className="w-64 bg-white shadow-md p-4 hidden md:block h-screen">
      <h2 className="text-lg font-semibold mb-6">Tableau de bord</h2>
      <nav className="space-y-4">
        <Link to="/" className="text-gray-700 hover:underline">
          Accueil
        </Link>

        {role === "etudiant" && (
          <>
            <Link to="/etudiant" className="text-blue-600 hover:underline">
              Logements disponibles
            </Link>
            <Link to="/etudiant/reservations" className="text-blue-600 hover:underline">
              Mes réservations
            </Link>
            <Link to="/profil" className="text-blue-600 hover:underline">
              Mon profil
            </Link>  
          </>
        )}

        {role === "proprietaire" && (
          <Link to="/proprietaire" className="text-blue-600 hover:underline">
            Chambres enregistrées
          </Link>
        )}

        <a
          href="/connexion"
          onClick={() => localStorage.removeItem("utilisateurConnecte")}
          className="text-red-600 hover:underline block mt-6"
        >
          Se déconnecter
        </a>
      </nav>
    </aside>
  );
}

export default MenuLateral;