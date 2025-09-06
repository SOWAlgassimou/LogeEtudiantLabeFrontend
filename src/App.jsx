import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import Prive from "./gabarits/Prive";
import TableauEtudiant from "./pages/TableauEtudiant";
import TableauProprietaire from "./pages/TableauProprietaire";
import DetailChambre from "./pages/DetailChambre";
import ReservationsEtudiant from "./pages/ReservationsEtudiant";
import OngletsEtudiant from "./pages/OngletsEtudiant";
import OngletsProprietaire from "./pages/OngletsProprietaire";
import ProfilUtilisateur from "./pages/ProfilUtilisateur";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        {/* Routes sous layout privé */}
        <Route element={<Prive />}>
          <Route path="/etudiant" element={<OngletsEtudiant />} />
          <Route path="/proprietaire" element={<OngletsProprietaire />} />
          <Route path="/chambre/:id" element={<DetailChambre />} />
          <Route path="/etudiant/reservations" element={<ReservationsEtudiant />} />
          <Route path="/profil" element={<ProfilUtilisateur />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;