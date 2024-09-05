import axios from "axios";

const api = axios.create({
  baseURL: "https://foodiedelight-backend.onrender.com/v1",
});

export const restaurantService = {
  getAll: () => api.get("/restaurants"),
  addRestaurant: (data) => api.post("/restaurant", data),
  deleteRestaurant: (id) => api.delete(`/restaurant/${id}`),
  updateRestaurant: ({ id, data }) => api.put(`/restaurant/${id}`, { ...data }),
};

export const menuService = {
  getMenuByRestaurant: (id) => api.get(`/menu/${id}`),
  addMenuItem: (data) => api.post("/menu", data),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
  updateMenuItem: ({ id, data }) => api.put(`/menu/${id}`, { ...data }),
};
