import { http } from "./http";

const API_PREFIX = "/auth"; // baseURL already includes /api

export async function login(email, password) {
  const { data } = await http.post(`${API_PREFIX}/login`, { email, password });
  return data; // { token, user }
}

export async function register(payload) {
  const { data } = await http.post(`${API_PREFIX}/register`, payload);
  return data;
}

export async function verifyEmail(token) {
  const { data } = await http.get(`${API_PREFIX}/verify-email`, { params: { token } });
  return data;
}
