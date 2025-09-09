import { http } from "./http";

const API_PREFIX = "/chambres";

export async function getChambres(params = {}) {
  // Backward-compat: if a string (token) is passed, ignore it and use empty params
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
    params = {};
  }
  const { data } = await http.get(API_PREFIX, { params: { ...params, t: Date.now() } });
  // Normalize to array for various backend shapes
  const list = Array.isArray(data)
    ? data
    : (data?.chambres || data?.items || data?.data || data?.results || []);
  return list;
}

export async function getChambreById(id) {
  const { data } = await http.get(`${API_PREFIX}/${id}`);
  const chambre = data?.chambre ?? data;
  return chambre;
}

export async function createChambre(payload) {
  // Expect payload to be either plain JSON or FormData depending on backend
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
  const { data } = await http.post(API_PREFIX, payload, { headers });
  return data;
}

export async function updateChambre(id, payload) {
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
  const { data } = await http.put(`${API_PREFIX}/${id}`, payload, { headers });
  return data;
}

export async function deleteChambre(id) {
  const { data } = await http.delete(`${API_PREFIX}/${id}`);
  return data;
}
