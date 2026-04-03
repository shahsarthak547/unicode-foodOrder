import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem("restaurantId"));

  const login = (jwt, rId) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("restaurantId", rId);
    setToken(jwt);
    setRestaurantId(rId);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("restaurantId");
    setToken(null);
    setRestaurantId(null);
  };

  return (
    <AuthContext.Provider value={{ token, restaurantId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
