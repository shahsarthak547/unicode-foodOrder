import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const getOrders = () => {
  return api.get("/admin/orders/");
};

export const updateOrderStatus = (id, status) => {
  return api.put(`/admin/orders/${id}/`, { status });
};

export const getMenu = () => {
  return api.get("/admin/menu/");
};

export const addMenuItem = (data) => {
  return api.post("/admin/menu/", data);
};

export const updateMenuItem = (id, data) => {
  return api.put(`/admin/menu/${id}/`, data);
};

export const deleteMenuItem = (id) => {
  return api.delete(`/admin/menu/${id}/`);
};

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/admin/menu/csv-upload/", formData);
};

export const getAnalytics = (restaurantId) => {
  return api.get(`/api/restaurants/${restaurantId}/analytics/`);
};

export const verifyPayment = (orderId) => {
  return api.patch(`/api/orders/${orderId}/verify/`);
};
