import { http } from "./http";

export async function getMessages() {
  const { data } = await http.get("/messages");
  return data;
}

export async function sendMessage(payload) {
  const { data } = await http.post("/messages", payload);
  return data;
}