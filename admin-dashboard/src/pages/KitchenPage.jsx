import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../api/adminApi";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, Coffee, LayoutGrid, Timer } from "lucide-react";
import { Link } from "react-router-dom";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const fetchActiveOrders = async () => {
    try {
      const res = await getOrders();
      // Only show PENDING or IN_PROGRESS orders in KDS
      const active = res.data.filter(o => o.status === "PENDING" || o.status === "IN_PROGRESS");
      setOrders(active);
    } catch (err) {
      console.error("Failed to fetch kitchen orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();

    // Timer sync for "time ago"
    const timer = setInterval(() => setNow(new Date()), 30000);

    const wsUrl = `ws://127.0.0.1:8000/ws/restaurant/4/orders/`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.message) return;

      const { action, order } = data.message;

      if (action === 'order_created') {
        setOrders(prev => [...prev, order]);
      } else if (action === 'order_updated') {
        if (order.status === "COMPLETED" || order.status === "CANCELLED") {
          setOrders(prev => prev.filter(o => o.id !== order.id));
        } else {
          setOrders(prev => prev.map(o => o.id === order.id ? order : o));
        }
      }
    };

    return () => {
      socket.close();
      clearInterval(timer);
    };
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
    } catch (err) {
      alert("Failed to update kitchen status");
    }
  };

  const getTimeDiff = (createdAt) => {
    const diff = Math.floor((now - new Date(createdAt)) / 60000);
    return diff < 1 ? "Just now" : `${diff}m ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] p-6 font-sans selection:bg-orange-500/30">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-orange-500 p-2 rounded-lg">
                <ChefHat className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Kitchen Display System</h1>
            </div>
            <p className="text-white/40 font-bold uppercase text-xs tracking-[0.2em] flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Kitchen Feed
            </p>
          </div>

          <div className="flex items-center gap-4">
             <Link to="/admin/orders" className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-white font-bold transition flex items-center gap-2 border border-white/10">
                <LayoutGrid size={18} /> Exit KDS
             </Link>
             <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Active Tickets</p>
                <p className="text-white text-2xl font-black leading-none">{orders.length}</p>
             </div>
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[40px]">
            <Coffee size={80} className="text-white/10 mb-6" />
            <h2 className="text-3xl font-black text-white/20 uppercase tracking-widest">No Active Orders</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#222] border-2 border-white/5 rounded-[32px] overflow-hidden flex flex-col h-full shadow-2xl"
                >
                  <div className={`p-5 flex justify-between items-center ${order.status === "IN_PROGRESS" ? "bg-blue-600" : "bg-orange-600"}`}>
                    <div>
                      <h2 className="text-3xl font-black text-white leading-none mb-1">#{order.id}</h2>
                      <p className="text-white/70 text-sm font-black uppercase tracking-widest">Table {order.table_number}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-white font-black text-xl mb-1">
                        <Timer size={20} />
                        {getTimeDiff(order.created_at)}
                      </div>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{order.status}</p>
                    </div>
                  </div>

                  <div className="p-6 flex-1 bg-gradient-to-b from-[#222] to-[#1A1A1A]">
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 font-black text-xl shrink-0">
                            {item.quantity}
                          </div>
                          <div className="flex-1">
                            <p className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{item.menu_item_name}</p>
                            {order.note && idx === 0 && (
                              <p className="mt-2 text-sm bg-yellow-400/10 text-yellow-400 p-2 rounded-lg font-bold border border-yellow-400/20">
                                Note: {order.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-2 gap-3 bg-[#111]">
                    {order.status === "PENDING" ? (
                      <button 
                         onClick={() => handleStatusUpdate(order.id, "IN_PROGRESS")}
                         className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl uppercase transition active:scale-95 flex items-center justify-center gap-3"
                      >
                         <Clock size={24} /> Start Cooking
                      </button>
                    ) : (
                      <>
                        <button 
                           onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                           className="bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-black text-xl uppercase transition active:scale-95 flex items-center justify-center gap-3"
                        >
                           <CheckCircle size={24} /> Done
                        </button>
                        <button 
                           onClick={() => handleStatusUpdate(order.id, "PENDING")}
                           className="bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-black text-sm uppercase transition active:scale-95 border border-white/10"
                        >
                           Revert
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function ChefHat({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 18h12" />
      <path d="M6 22h12" />
      <path d="M17 14c2.8 0 5-2.2 5-5s-2.2-5-5-5a5 5 0 0 0-10 0 5 5 0 0 0-5 5c0 2.8 2.2 5 5 5" />
      <path d="M9 18v-4" />
      <path d="M15 18v-4" />
    </svg>
  );
}
