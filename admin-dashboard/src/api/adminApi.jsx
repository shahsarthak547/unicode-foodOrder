// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
// });

// // 🔒 ALWAYS attach token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export const getOrders = () => api.get("/admin/orders/");

// export const updateOrderStatus = (id, status) =>
//   api.put(`/admin/orders/${id}/`, { status });

// export const getMenu = () => api.get("/admin/menu/");
// export const addMenuItem = (data) => api.post("/admin/menu/", data);
// export const updateMenuItem = (id, data) =>
//   api.put(`/admin/menu/${id}/`, data);
// export const deleteMenuItem = (id) =>
//   api.delete(`/admin/menu/${id}/`);

// export const uploadCSV = (file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   return api.post("/admin/menu/csv-upload/", formData);
// };
import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

/* ================= JWT INTERCEPTOR ================= */
// 🔒 Automatically attach JWT token to every request
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

/* ================= ORDERS ================= */

export const getOrders = () => {
  return api.get("/admin/orders/");
};

export const updateOrderStatus = (id, status) => {
  return api.put(`/admin/orders/${id}/`, { status });
};

/* ================= MENU ================= */

export const getMenu = () => {
  return api.get("/admin/menu/");
};

/*
  IMPORTANT:
  - data MUST be FormData when image is involved
  - DO NOT set Content-Type manually
  - Axios will auto-set multipart boundary
*/
export const addMenuItem = (data) => {
  return api.post("/admin/menu/", data);
};

export const updateMenuItem = (id, data) => {
  return api.put(`/admin/menu/${id}/`, data);
};

export const deleteMenuItem = (id) => {
  return api.delete(`/admin/menu/${id}/`);
};

/* ================= CSV UPLOAD ================= */

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/admin/menu/csv-upload/", formData);
};
