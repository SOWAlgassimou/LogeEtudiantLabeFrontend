import { Link } from "react-router-dom";


function BarreNavigation() {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Logement Labé</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Accueil</Link>
        <Link to="/connexion" className="hover:underline">Connexion</Link>
        <Link to="/inscription" className="hover:underline">Inscription</Link>
      </div>
    </nav>
  );
}

export default BarreNavigation;