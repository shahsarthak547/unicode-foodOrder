import axios from "axios";

const api = axios.create({
  baseURL: "http://10.195.227.158:8000",
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

export const verifyPayment = (orderId) => api.post(`/api/orders/${orderId}/verify/`);

// Coupon Management
export const getCoupons = (restaurantId) => api.get(`/api/coupons/validate/ALL/?restaurant_id=${restaurantId}`);
export const addCoupon = (data) => api.post("/api/coupons/validate/CREATE/", data); 
export const deleteCoupon = (code) => api.delete(`/api/coupons/validate/${code}/`);
