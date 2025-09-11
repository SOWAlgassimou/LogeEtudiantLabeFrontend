import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
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
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import DashboardAdmin from "./pages/DashboardAdmin";
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        {/* Routes sous layout privé protégées */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Prive />}>
            <Route path="/chambre/:id" element={<DetailChambre />} />
            <Route path="/profil" element={<ProfilUtilisateur />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Groupes par rôle */}
        <Route element={<ProtectedRoute roles={["etudiant"]} />}>
          <Route element={<Prive />}>
            <Route path="/etudiant" element={<OngletsEtudiant />} />
            <Route path="/etudiant/reservations" element={<ReservationsEtudiant />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["proprietaire"]} />}>
          <Route element={<Prive />}>
            <Route path="/proprietaire" element={<OngletsProprietaire />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route element={<Prive />}>
            <Route path="/admin" element={<DashboardAdmin />} />
          </Route>
        </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;