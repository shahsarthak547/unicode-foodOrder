import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import PrivateRoute from "./routes/PrivateRoute";
import { useAuth } from "./auth/AuthContext";
import MenuManagementPage from "./pages/MenuManagementPage";
import QRGeneratorPage from "./pages/QRGeneratorPage";
export default function App() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/orders"
        element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/admin/menu"
        element={
          <PrivateRoute>
            <MenuManagementPage />
          </PrivateRoute>
        }
      />
      <Route path="/admin/qr-generator"
        element={
          <PrivateRoute>
            <QRGeneratorPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}