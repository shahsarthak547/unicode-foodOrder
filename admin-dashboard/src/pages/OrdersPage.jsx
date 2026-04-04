import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, verifyPayment } from "../api/adminApi";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, CheckCircle, Clock, RefreshCcw, BarChart3, ShieldCheck, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function OrdersPage() {
  const { restaurantId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch initial orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      await verifyPayment(orderId);
      // Local state update for immediate feedback
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: "PAID" } : o));
    } catch (err) {
      alert("Failed to verify payment");
    }
  };

  useEffect(() => {
    // 1. Initial Data Load
    fetchOrders();

    // 2. Setup WebSocket for real-time order tracking
    if (!restaurantId) return;
    const wsUrl = `ws://10.56.145.158:8000/ws/restaurant/${restaurantId}/orders/`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected for Admin Order Tracking");
    };

    const playNotificationSound = () => {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(err => console.log("Audio play blocked until user interaction", err));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.message) return;

      const { action, order } = data.message;

      if (action === 'order_created') {
         // Prepend new order to list
         setOrders(prev => [order, ...prev]);
         playNotificationSound();
         console.log("New order received via WS:", order.id);
      } 
      else if (action === 'order_updated') {
         // Update existing order in list
         setOrders(prev => prev.map(o => o.id === order.id ? order : o));
         console.log("Order updated via WS:", order.id);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Cleanup on unmount
    return () => socket.close();
  }, [restaurantId]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // API call triggers the WS broadcast from the server.
      // We don't need to manually refetch/update UI here because the WS message will handle it!
      await updateOrderStatus(id, newStatus);
    } catch {
      alert("Failed to update status");
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F0]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mb-4 text-[#D4A373]">
            <Coffee size={40} />
        </motion.div>
        <p className="text-[#8C7A6B] font-medium tracking-wide">Syncing kitchen orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] px-4 py-8 selection:bg-[#D4A373]/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-[#E6D5C3]">
          <div>
            <h1 className="text-3xl font-extrabold text-[#4A3B32] tracking-tight flex items-center gap-3">
              <img src="/serveflow-logo.png" alt="ServeFlow Logo" className="w-10 h-10 object-contain" />
              Live Orders
            </h1>
            <p className="text-sm text-[#8C7A6B] mt-1 font-medium">
              Kitchen & counter management
            </p>
          </div>

          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#E6D5C3] items-center gap-2">
            <div className="flex">
              {["all", "pending", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                    filter === f
                      ? "bg-white text-[#4A3B32] shadow-sm"
                      : "text-[#8C7A6B] hover:text-[#4A3B32]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-[#E6D5C3] mx-1" />
            <Link to="/admin/kds" className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition font-bold text-sm flex items-center gap-2">
              <RefreshCcw size={18} />
              Kitchen (KDS)
            </Link>
            <Link to="/admin/coupons" className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-bold text-sm flex items-center gap-2">
              <Ticket size={18} />
              Coupons
            </Link>
            <Link to="/admin/analytics" className="px-4 py-2 text-[#D4A373] hover:bg-white rounded-lg transition font-bold text-sm flex items-center gap-2">
              <BarChart3 size={18} />
              Insights
            </Link>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center bg-white rounded-[32px] p-16 shadow-sm border border-[#E6D5C3] text-center"
          >
            <div className="w-24 h-24 bg-[#FAF6F0] rounded-full flex items-center justify-center mb-6">
              <Coffee size={48} className="text-[#D4A373]/50" />
            </div>
            <p className="text-xl font-bold text-[#4A3B32] mb-2">
              Kitchen is caught up
            </p>
            <p className="text-[#8C7A6B] font-medium">
              Waiting for new orders to arrive
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredOrders.map((order) => {
                const total = order.items.reduce(
                  (sum, item) => sum + Number(item.price_at_order) * item.quantity,
                  0
                );

                const isPending = order.status === "PENDING" || order.status === "IN_PROGRESS";

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`
                      rounded-[24px] p-6 shadow-sm border relative overflow-hidden flex flex-col
                      ${isPending
                        ? "bg-white border-[#E6D5C3]"
                        : "bg-[#FAF6F0]/50 border-green-200"}
                    `}
                  >
                    {isPending && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#E07A5F]" />
                    )}
                    
                    {!isPending && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                    )}

                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-black text-[#4A3B32]">
                          #{order.id}
                        </h2>
                        <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider bg-[#FAF6F0] text-[#D4A373] border border-[#E6D5C3]">
                          TABLE {order.table_number}
                        </span>
                        {order.payment_status === "PAID" ? (
                          <span className="inline-block ml-2 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-green-500/10 text-green-600 border border-green-500/20 uppercase">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-block ml-2 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                            Unpaid
                          </span>
                        )}
                      </div>

                        <span
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5
                            ${order.status === "PENDING" ? "bg-amber-100 text-amber-700" : 
                              order.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-700" :
                              "bg-green-100 text-green-700"}
                          `}
                        >
                          {order.status === "PENDING" ? <Clock size={12} /> : 
                           order.status === "COMPLETED" ? <CheckCircle size={12} /> : 
                           <RefreshCcw size={12} className="animate-spin-slow" />}
                          {order.status}
                        </span>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm items-start gap-4"
                        >
                          <span className="font-semibold text-[#4A3B32]">
                            <span className="text-[#8C7A6B] mr-2">{item.quantity}×</span>
                            {item.menu_item_name}
                          </span>
                          <span className="font-medium text-[#8C7A6B] shrink-0">
                            ₹{item.price_at_order}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col pt-4 border-t border-[#E6D5C3] mt-auto">
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-xs font-bold text-green-600 mb-1">
                           <span>Discount Applied</span>
                           <span>-₹{order.discount_amount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-black text-[#4A3B32]">
                          ₹{total - (order.discount_amount || 0)}
                        </p>
                        
                        <div className="flex items-center gap-2">
                        {order.payment_status === "PENDING" && (
                          <button
                            onClick={() => handleVerifyPayment(order.id)}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                          >
                            <ShieldCheck size={14} /> Verify Payment
                          </button>
                        )}

                        {(order.status === "PENDING" || order.status === "IN_PROGRESS") && (
                          <button
                            onClick={() => handleStatusChange(order.id, "COMPLETED")}
                            className="bg-[#4A3B32] hover:bg-[#2D241F] text-white px-5 py-2 rounded-xl font-bold tracking-wide active:scale-95 transition shadow-sm"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
