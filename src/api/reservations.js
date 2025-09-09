import { http } from "./http";

const API_PREFIX = "/reservations";

export async function getReservations(params = {}) {
  // Backward-compat: tolerate primitive first arg
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
    params = {};
  }
  const { data } = await http.get(API_PREFIX, { params });
  return data;
}

export async function createReservation(payload) {
  const { data } = await http.post(API_PREFIX, payload);
  return data;
}

export async function deleteReservation(id) {
  const { data } = await http.delete(`${API_PREFIX}/${id}`);
  return data;
}

// Propriétaire: lister et valider les réservations
export async function getOwnerReservations(params = {}) {
  const { data } = await http.get(`/proprietaire${API_PREFIX}`, { params });
  return data;
}

export async function validateOwnerReservation(id, payload = {}) {
  const { data } = await http.put(`/proprietaire${API_PREFIX}/${id}`, payload);
  return data;
}
