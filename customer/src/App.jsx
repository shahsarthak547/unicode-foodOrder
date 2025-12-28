import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderSuccess from "./pages/OrderSuccess";
import OrderStatusPage from "./pages/OrderStatusPage";
import HomePage from "./pages/HomePage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/restaurant/:restaurantId/table/:tableNumber"
          element={<HomePage />}
        />
        <Route
          path="/restaurant/:restaurantId/table/:tableNumber/menu"
          element={<MenuPage />}
        />
        <Route
          path="/restaurant/:restaurantId/table/:tableNumber/cart"
          element={<CartPage />}
        />
        <Route
          path="/restaurant/:restaurantId/table/:tableNumber/order-status/:orderId"
          element={<OrderStatusPage />}
        />
        <Route
          path="/restaurant/:restaurantId/table/:tableNumber/success"
          element={<OrderSuccess />}
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
