import { useCart } from "../context/CartContext";
import { useParams, useNavigate } from "react-router-dom";
import { placeOrder } from "../api/customerApi";
import { useState } from "react";

export default function CartPage() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    total,
    clearCart
  } = useCart();

  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
        bg-gradient-to-b from-[#eef2f7] to-[#dbe3ee]
        text-gray-700 px-6 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-2xl font-bold mb-1">Your cart is empty</p>
        <p className="text-sm opacity-80">
          Add items from the menu to continue
        </p>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (phone.length < 10) {
      alert("Enter a valid phone number");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        table_number: tableNumber,
        phone_number: phone,
        note: "",
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      };

      const res = await placeOrder(restaurantId, payload);
      const orderId = res.id;

      clearCart();

      navigate(
        `/restaurant/${restaurantId}/table/${tableNumber}/order-status/${orderId}`
      );
    } catch (err) {
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-32
      bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-red-50">

      {/* 🧾 HEADER */}
      <div className="ssticky top-0 z-20 backdrop-blur-md bg-white/10 border-b border-white/10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Review Your Order
          </h1>
          <p className="text-xs text-red/70">
            Table {tableNumber} · Almost done
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* 🛍 CART ITEMS */}
        {cart.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-3xl
              bg-[#e8edf4]
              shadow-[0_12px_30px_rgba(0,0,0,0.12)]
              transition hover:scale-[1.01]"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">
                  ₹{item.price} per item
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-xs text-rose-600 hover:underline"
              >
                Remove
              </button>
            </div>

            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-4
                bg-[#cfd8e3] rounded-full px-5 py-2">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="text-xl font-bold text-gray-700 active:scale-90"
                >
                  −
                </button>

                <span className="font-bold text-gray-900">
                  {item.quantity}
                </span>

                <button
                  onClick={() => increaseQty(item.id)}
                  className="text-xl font-bold text-gray-700 active:scale-90"
                >
                  +
                </button>
              </div>

              <span className="ml-auto text-lg font-bold text-gray-900">
                ₹{Number(item.price) * item.quantity}
              </span>
            </div>
          </div>
        ))}

        {/* 📱 PHONE INPUT */}
        <div className="p-6 rounded-3xl
          bg-[#e8edf4]
          shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
          <label className="text-sm font-semibold text-gray-800">
            Phone number
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Used only for order updates · No login required
          </p>

          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full rounded-xl
              bg-[#cfd8e3]
              border border-[#bcc7d6]
              p-3 text-gray-900
              focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* 🚀 PLACE ORDER BAR */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <div className="max-w-md mx-auto
          bg-[#dde5ef]
          rounded-3xl
          shadow-[0_20px_40px_rgba(0,0,0,0.18)]
          px-6 py-4 flex justify-between items-center">

          <div>
            <p className="text-xs text-gray-600">Payable Amount</p>
            <p className="text-2xl font-extrabold text-gray-900">
              ₹{total}
            </p>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-600
              text-white px-7 py-3 rounded-2xl
              font-bold tracking-wide
              active:scale-95 transition disabled:opacity-60"
          >
            {loading ? "Placing..." : "Place Order →"}
          </button>
        </div>
      </div>
    </div>
  );
}
