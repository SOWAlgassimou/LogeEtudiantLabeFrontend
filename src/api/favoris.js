import { http } from "./http";

export async function getFavoris() {
  const { data } = await http.get("/users/favoris");
  return data;
}

export async function addFavori(chambreId) {
  const { data } = await http.post("/users/favoris", { chambre: chambreId });
  return data;
}

export async function removeFavori(chambreId) {
  const { data } = await http.delete("/users/favoris", { data: { chambre: chambreId } });
  return data;
}