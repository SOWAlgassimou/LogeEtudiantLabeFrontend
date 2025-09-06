import { Outlet } from "react-router-dom";
import MenuLateral from "../composants/MenuLateral";


function Prive() {
  const utilisateur = JSON.parse(localStorage.getItem("utilisateurConnecte"));
  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateral role={utilisateur?.role} />
      {/* Barre latérale */}
      <aside className="w-64 bg-white shadow-md p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-6">Mon Tableau</h2>
        <nav className="space-y-4">
          <a href="/etudiant" className="block text-blue-600 hover:underline">Dashboard Étudiant</a>
          <a href="/proprietaire" className="block text-blue-600 hover:underline">Dashboard Propriétaire</a>
          <a href="/" className="block text-gray-600 hover:underline">Déconnexion</a>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Prive;

