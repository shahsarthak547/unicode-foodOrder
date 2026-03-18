import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRestaurantDetails } from "../api/customerApi";
import { motion } from "framer-motion";
import { Coffee, ChevronRight, MapPin } from "lucide-react";

export default function HomePage() {
    const { restaurantId, tableNumber } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const activeOrderId = localStorage.getItem("activeOrderId");
        if (activeOrderId) {
            navigate(`/restaurant/${restaurantId}/table/${tableNumber}/order-status/${activeOrderId}`);
        }
        fetchRestaurantDetails(restaurantId)
        .then((data) => {
            setRestaurant(data);
            setLoading(false);
        });
    }, [restaurantId, tableNumber, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center px-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mb-4 text-[#D4A373]">
                    <Coffee size={40} />
                </motion.div>
                <p className="text-[#8C7A6B] font-medium tracking-wide">Waking up the barista...</p>
            </div>
        );
    }

    if(!restaurant) {
        return <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center px-4 text-[#4A3B32]">Restaurant not found.</div>;
    }

    return (
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center px-5 selection:bg-[#D4A373]/30">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-xl shadow-[#4A3B32]/5 p-8 text-center relative overflow-hidden"
            >
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#D4A373] rounded-full blur-[80px] opacity-20" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#E07A5F] rounded-full blur-[80px] opacity-10" />
                
                <div className="relative z-10 flex justify-center mb-6">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-32 h-32 flex items-center justify-center -mb-8"
                    >
                        <img src="/serveflow-logo.png" alt="ServeFlow Logo" className="w-full h-full object-contain" />
                    </motion.div>
                </div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-[#4A3B32] tracking-tight leading-tight">
                        {restaurant.name}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-1 mt-2 text-[#8C7A6B]">
                        <MapPin size={14} />
                        <p className="text-sm font-medium">
                            {restaurant?.tagline || "Where taste meets technology"}
                        </p>
                    </div>

                    <div className="my-8 flex items-center justify-center gap-3">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#E6D5C3]" />
                        <div className="text-xs font-bold text-[#D4A373] uppercase tracking-widest">
                            Table {tableNumber}
                        </div>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#E6D5C3]" />
                    </div>

                    <p className="text-[#8C7A6B] text-sm mb-6">
                        Ready to view our artisanal menu?
                    </p>

                    <button
                        onClick={() => navigate(`/restaurant/${restaurantId}/table/${tableNumber}/menu`)}
                        className="w-full bg-[#4A3B32] hover:bg-[#3A2D25] text-white flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-[#4A3B32]/30 active:scale-95 group font-bold tracking-wide"
                    >
                        View Menu 
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="mt-8 pt-6 border-t border-[#E6D5C3]/50">
                        <p className="text-[10px] font-bold text-[#8C7A6B]/60 uppercase tracking-widest">
                            Scan · Order · Enjoy
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
