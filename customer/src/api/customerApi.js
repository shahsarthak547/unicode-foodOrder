import axios from "axios";

const API_BASE = "http://10.195.227.158:8000";

export const fetchRestaurantMenu = async (restaurantId) => {
  const response = await axios.get(
    `${API_BASE}/api/restaurants/${restaurantId}/menu/`
  );
  return response.data;
};
export const fetchRestaurantDetails = async (restaurantId) => {
  const response = await axios.get(
    `${API_BASE}/api/restaurants/${restaurantId}/`
  );
  return response.data;
};
export const placeOrder = async (restaurantId, payload) => {
  const res = await axios.post( 
    `${API_BASE}/api/restaurants/${restaurantId}/orders/`,
    payload
  );
  return res.data;
};
export const validateCoupon = async (code) => {
  const res = await axios.get(`${API_BASE}/api/coupons/validate/${code}/`);
  return res.data;
};