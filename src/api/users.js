import { http } from "./http";

export async function getUsers() {
  const { data } = await http.get("/users");
  return data;
}

export async function getUserById(id) {
  const { data } = await http.get(`/users/${id}`);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await http.put(`/users/${id}`, payload);
  return data;
}