import { http } from "./http";

const API_PREFIX = "/users";

export async function getUserById(id) {
  const { data } = await http.get(`${API_PREFIX}/${id}`);
  return data;
}

export async function updateUser(id, payload) {
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
  const { data } = await http.put(`${API_PREFIX}/${id}`, payload, { headers });
  return data;
}

// Optionnel: changer mot de passe si nécessaire
export async function changePassword(id, payload) {
  const { data } = await http.put(`${API_PREFIX}/${id}/password`, payload);
  return data;
}
