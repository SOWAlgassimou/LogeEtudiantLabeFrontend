import { http } from "./http";

export async function getNotifications() {
  const { data } = await http.get("/notifications");
  return data;
}

export async function markAsRead(id) {
  const { data } = await http.put(`/notifications/${id}`, { lu: true });
  return data;
}