import BarreNavigation from "../composants/BarreNavigation";

function Accueil() {
  return (
    <div>
      <BarreNavigation />
      <main className="text-center mt-12 px-4">
        <h2 className="text-3xl font-semibold mb-4">
          Bienvenue sur la plateforme de logement étudiant de l’Université de Labé
        </h2>
        <p className="text-lg mb-6 text-gray-700">
          Trouvez un dortoir adapté à vos besoins avant même le début des cours, sans vous déplacer.
        </p>
        <a
          href="/inscription"
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Commencer maintenant
        </a>
      </main>
      <div className="relative h-[350px] overflow-hidden">
        <img
          src="/image-dortoir.jpg"
          alt="Dortoir universitaire"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-5xl font-bold text-center px-4">
            Bienvenue à Logement Labé 🏫<br />
            Trouvez votre chambre en toute simplicité
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Accueil;