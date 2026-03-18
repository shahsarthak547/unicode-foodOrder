import { useCart } from "../context/CartContext";
import { useParams, useNavigate } from "react-router-dom";
import { placeOrder } from "../api/customerApi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Loader, QrCode, ShieldCheck, Check, ChevronLeft } from "lucide-react";

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeFromCart, total, clearCart } = useCart();
  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("review"); // 'review' or 'payment'

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F0] text-gray-700 px-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-amber-800/20 mb-6"
        >
          <ShoppingCart size={80} strokeWidth={1} />
        </motion.div>
        <p className="text-2xl font-bold mb-2 text-[#4A3B32]">Your cart is empty</p>
        <p className="text-sm text-[#8C7A6B]">Add some delicious items from the menu</p>
        <button 
          onClick={() => navigate(`/restaurant/${restaurantId}/table/${tableNumber}/menu`)}
          className="mt-8 px-6 py-3 bg-[#D4A373] hover:bg-[#C28E5C] text-white rounded-xl shadow-lg shadow-[#D4A373]/30 transition"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const payload = {
        table_number: tableNumber,
        phone_number: phone,
        note: "",
        payment_status: "PENDING",
        payment_method: "UPI",
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      };

      const res = await placeOrder(restaurantId, payload);
      const orderId = res.id;
      
      localStorage.setItem("activeOrderId", orderId);
      clearCart();
      navigate(`/restaurant/${restaurantId}/table/${tableNumber}/order-status/${orderId}`);
    } catch (err) {
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (phone.length < 10) {
      alert("Enter a valid phone number to continue");
      return;
    }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-32 bg-[#FAF6F0] selection:bg-[#D4A373]/30">
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#FAF6F0]/80 border-b border-[#E6D5C3]">
        <div className="px-5 py-5 flex items-center gap-4">
          {step === "payment" && (
            <button onClick={() => setStep("review")} className="p-2 hover:bg-[#E6D5C3] rounded-full transition text-[#4A3B32]">
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#4A3B32]">
              {step === "review" ? "Review Order" : "Payment"}
            </h1>
            <p className="text-xs text-[#8C7A6B] font-medium tracking-wide">
              TABLE {tableNumber} · {step === "review" ? "ALMOST DONE" : "SECURE CHECKOUT"}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "review" ? (
          <motion.div 
            key="review"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-5 space-y-4"
          >
            {cart.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item.id}
                className="p-4 rounded-2xl bg-white shadow-sm border border-[#E6D5C3]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="pr-4">
                    <h3 className="font-semibold text-lg text-[#4A3B32] leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#8C7A6B] shrink-0 mt-1">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[#E07A5F] p-2 hover:bg-[#E07A5F]/10 rounded-full transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-[#FAF6F0] rounded-xl p-1">
                  <div className="flex items-center">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="w-10 h-10 flex text-[#8C7A6B] items-center justify-center hover:bg-white rounded-lg shadow-sm transition"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-10 text-center font-bold text-[#4A3B32]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="w-10 h-10 flex text-[#8C7A6B] items-center justify-center hover:bg-white rounded-lg shadow-sm transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="pr-3 text-lg font-bold text-[#4A3B32]">
                    ₹{Number(item.price) * item.quantity}
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 mt-6 rounded-2xl bg-[#E6D5C3]/30 border border-[#E6D5C3]"
            >
              <label className="text-sm font-bold text-[#4A3B32]">Mobile Number</label>
              <p className="text-xs text-[#8C7A6B] mb-3">Needed to send you order updates</p>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl bg-white border-0 shadow-sm p-4 text-[#4A3B32] font-medium outline-none focus:ring-2 focus:ring-[#D4A373] transition placeholder:text-[#8C7A6B]/50"
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-5 flex flex-col items-center"
          >
            <div className="w-full bg-white rounded-[32px] p-8 shadow-sm border border-[#E6D5C3] text-center">
              <div className="flex justify-center mb-6">
                <div className="w-48 h-48 bg-[#FAF6F0] rounded-2xl flex items-center justify-center border-2 border-dashed border-[#D4A373] relative overflow-hidden group">
                  <QrCode size={120} className="text-[#4A3B32] opacity-80" />
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center flex-col gap-2">
                    <img src="/serveflow-logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-widest mb-2">Scan to Pay with UPI</p>
              <h2 className="text-3xl font-black text-[#4A3B32] mb-6">₹{total}</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-100 text-left">
                  <div className="bg-green-500 text-white p-1 rounded-full">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-800">Secure simulated payment</p>
                    <p className="text-[10px] text-green-700/70">Scan or click below to mock success</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 w-full px-4 text-center">
               <p className="text-xs text-[#8C7A6B] font-medium leading-relaxed">
                 Once you have transferred the amount, click the button below to confirm your order.
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0] to-transparent">
        <div className="max-w-md mx-auto bg-[#4A3B32] rounded-2xl shadow-xl shadow-[#4A3B32]/20 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <p className="text-xs text-white/70 uppercase font-medium tracking-wider">Total</p>
            <p className="text-2xl font-bold">₹{total}</p>
          </div>
          {step === "review" ? (
            <button
              onClick={handleProceedToPayment}
              className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#C28E5C] text-white px-6 py-3 rounded-xl font-bold transition active:scale-95"
            >
              Pay Now <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-70 active:scale-95 shadow-lg shadow-green-600/20"
            >
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <>I have Paid <Check size={20} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
