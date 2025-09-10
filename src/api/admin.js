import { http } from "./http";

// Gestion des utilisateurs
export async function getAdminUsers(params = {}) {
  const { data } = await http.get("/admin/users", { params });
  return data;
}

export async function changeUserRole(userId, role) {
  const { data } = await http.patch(`/admin/users/${userId}/role`, { role });
  return data;
}

// Gestion des chambres
export async function getAdminChambres(params = {}) {
  const { data } = await http.get("/admin/chambres", { params });
  return data;
}

// Gestion des réservations
export async function getAdminReservations(params = {}) {
  const { data } = await http.get("/admin/reservations", { params });
  return data;
}

// Statistiques
export async function getStats() {
  const { data } = await http.get("/admin/stats");
  return data;
}