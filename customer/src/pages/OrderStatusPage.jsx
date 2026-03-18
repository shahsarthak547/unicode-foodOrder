import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, CheckCircle, PackageSearch, Star, ShieldCheck } from "lucide-react";

export default function OrderStatusPage() {
  const { orderId, restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("PENDING");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/orders/${orderId}/`);
        processStatusUpdate(res.data.status);
      } catch (err) {
        console.error("Failed to fetch initial order status", err);
      }
    };
    fetchStatus();

    // 2. Setup WebSocket
    const wsUrl = `ws://127.0.0.1:8000/ws/restaurant/${restaurantId}/orders/`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message && data.message.action === 'order_updated') {
        const updatedOrder = data.message.order;
        if (updatedOrder.id.toString() === orderId.toString()) {
          processStatusUpdate(updatedOrder.status);
        }
      }
    };

    return () => socket.close();
  }, [orderId, restaurantId, tableNumber, navigate]);

  const processStatusUpdate = (newStatus) => {
    setStatus(newStatus);
    
    if (
      (newStatus === "COMPLETED" || newStatus === "CANCELLED") &&
      !redirectedRef.current
    ) {
      redirectedRef.current = true;
      localStorage.removeItem("activeOrderId");
      // Longer delay to allow for rating
      setTimeout(() => {
        if (!hasRated) navigate(`/restaurant/${restaurantId}/table/${tableNumber}`);
      }, 15000);
    }
  }

  const submitRating = async (val) => {
    try {
      setRating(val);
      await axios.patch(`http://127.0.0.1:8000/api/orders/${orderId}/review/`, {
        rating: val
      });
      setHasRated(true);
      // Faster redirect after rating
      setTimeout(() => {
        navigate(`/restaurant/${restaurantId}/table/${tableNumber}`);
      }, 3000);
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  }

  const steps = [
    { label: "Received", done: true },
    { label: "Brewing", done: status === "IN_PROGRESS" || status === "COMPLETED" },
    { label: "Ready", done: status === "COMPLETED" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAF6F0] selection:bg-[#D4A373]/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full rounded-[32px] p-8 bg-white shadow-xl shadow-[#4A3B32]/5 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4A373] to-[#E07A5F]" />
        
        <div className="flex justify-between items-center mb-10 relative mt-4">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 relative z-10">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ 
                    scale: step.done ? 1.1 : 1,
                    backgroundColor: step.done ? "#D4A373" : "#FAF6F0",
                    color: step.done ? "#FFF" : "#8C7A6B" 
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white"
                >
                  {step.done ? <CheckCircle size={18} /> : index + 1}
                </motion.div>
                <p className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${step.done ? "text-[#4A3B32]" : "text-[#8C7A6B]"}`}>
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="absolute top-5 left-[50%] w-full h-1 -z-10 bg-[#FAF6F0]">
                  <motion.div
                    animate={{ width: steps[index + 1].done ? "100%" : "0%" }}
                    className="h-full bg-[#D4A373]"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {status === "COMPLETED" ? (
             <motion.div
               key="completed-view"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
             >
               {!hasRated ? (
                 <>
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <PackageSearch size={32} />
                   </div>
                   <h2 className="text-2xl font-black text-[#4A3B32] mb-2">Order Ready!</h2>
                   <p className="text-[#8C7A6B] text-sm mb-8">Collect your drink at the counter. How was your experience?</p>
                   
                   <div className="flex justify-center gap-2 mb-8">
                     {[1, 2, 3, 4, 5].map((num) => (
                       <button
                         key={num}
                         onMouseEnter={() => setHoveredRating(num)}
                         onMouseLeave={() => setHoveredRating(0)}
                         onClick={() => submitRating(num)}
                         className="transition-transform active:scale-90"
                       >
                         <Star 
                           size={36} 
                           fill={(hoveredRating || rating) >= num ? "#D4A373" : "none"} 
                           className={(hoveredRating || rating) >= num ? "text-[#D4A373]" : "text-[#E6D5C3]"}
                         />
                       </button>
                     ))}
                   </div>
                   <p className="text-[10px] text-[#8C7A6B] font-bold uppercase tracking-widest">Tap a star to rate</p>
                 </>
               ) : (
                 <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <div className="w-16 h-16 bg-[#D4A373] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4A373]/20">
                      <Star size={32} fill="white" />
                    </div>
                    <h2 className="text-2xl font-black text-[#4A3B32] mb-2">Thank You!</h2>
                    <p className="text-[#8C7A6B] text-sm mb-6">Enjoy your beverage. We hope to see you again soon!</p>
                    <button 
                      onClick={() => navigate(`/restaurant/${restaurantId}/table/${tableNumber}`)}
                      className="text-white bg-[#4A3B32] px-8 py-3 rounded-2xl font-bold text-sm transition active:scale-95"
                    >
                      Back to Menu
                    </button>
                 </motion.div>
               )}
             </motion.div>
          ) : (
            <motion.div
              key="pending-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-center mb-8 relative">
                <div className="absolute inset-0 bg-[#D4A373]/20 rounded-full animate-ping" />
                <div className="w-20 h-20 rounded-full bg-[#FAF6F0] text-[#D4A373] flex items-center justify-center relative z-10 shadow-inner">
                  <Coffee size={40} />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-[#4A3B32] mb-3">Crafting Your Order</h1>
              <p className="text-[#8C7A6B] text-sm mb-8 px-4">Your delicious items are being prepared with care.</p>

              <div className="w-full bg-[#FAF6F0] rounded-full h-2 overflow-hidden mb-3">
                <motion.div 
                  className="h-full bg-[#D4A373] rounded-full"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  style={{ width: "40%" }}
                />
              </div>
              <p className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-widest">Checking the kitchen...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 pt-6 border-t border-[#E6D5C3]">
           <div className="flex justify-between items-center text-xs mb-3">
              <span className="font-bold text-[#8C7A6B] uppercase tracking-wider">Order #{orderId}</span>
              <span className="bg-green-100 text-green-700 font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase text-[9px]">
                 <ShieldCheck size={10} /> Paid
              </span>
           </div>
           <div className="bg-[#FAF6F0] p-4 rounded-2xl text-left border border-[#E6D5C3]/50">
              <p className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-tighter mb-1">Serving at</p>
              <p className="text-sm font-bold text-[#4A3B32]">Table {tableNumber}</p>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
