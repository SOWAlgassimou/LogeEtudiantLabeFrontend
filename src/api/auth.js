import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export async function login(email, password) {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data; // { token, user }
}

export async function register(data) {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
}

export async function verifyEmail(token) {
  const res = await axios.get(`${API_URL}/verify-email?token=${token}`);
  return res.data;
}

const token = localStorage.getItem("token");
localStorage.setItem("token", token);