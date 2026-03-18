import { useEffect, useState } from "react";
import { getAnalytics } from "../api/adminApi";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Star, ArrowLeft, Coffee, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Using restaurant ID 4 (Byte Brew)
        const res = await getAnalytics(4);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F0]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[#D4A373] mb-4"
        >
          <BarChart3 size={48} />
        </motion.div>
        <p className="text-[#8C7A6B] font-medium tracking-wide">Calculating insights...</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue", value: `₹${data?.total_revenue?.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Orders", value: data?.order_count, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Avg. Rating", value: data?.average_rating, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] px-4 py-8 selection:bg-[#D4A373]/30">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/admin/orders" className="flex items-center gap-2 text-[#8C7A6B] hover:text-[#4A3B32] transition font-bold group">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-[#E6D5C3] group-hover:scale-110 transition">
              <ArrowLeft size={20} />
            </div>
            Back to Orders
          </Link>
          <h1 className="text-3xl font-black text-[#4A3B32]">Sales Insights</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E6D5C3] flex items-center gap-5"
            >
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-[#4A3B32]">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-[#E6D5C3]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-[#4A3B32] flex items-center gap-3">
                < Award className="text-[#D4A373]" /> Best Sellers
              </h2>
              <span className="text-[10px] font-bold text-[#8C7A6B] bg-[#FAF6F0] px-3 py-1 rounded-full uppercase tracking-tighter">Top 5 Items</span>
            </div>

            <div className="space-y-6">
              {data?.popular_items?.map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#4A3B32] group-hover:text-[#D4A373] transition">{item.menu_item__name}</span>
                    <span className="text-sm font-black text-[#8C7A6B]">{item.total_sold} sold</span>
                  </div>
                  <div className="w-full bg-[#FAF6F0] h-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.popular_items?.[0]?.total_sold ? (item.total_sold / data.popular_items[0].total_sold) * 100 : 0}%` }}
                      className="h-full bg-gradient-to-r from-[#D4A373] to-[#E07A5F] rounded-full"
                    />
                  </div>
                </div>
              ))}
              {(!data?.popular_items || data.popular_items.length === 0) && (
                <p className="text-center py-10 text-[#8C7A6B] italic font-medium">No sales data yet today.</p>
              )}
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="bg-[#4A3B32] p-8 rounded-[32px] shadow-sm text-white relative overflow-hidden"
          >
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
               <Coffee size={200} />
            </div>
            
            <h2 className="text-xl font-bold mb-6 relative z-10">ServeFlow Tips</h2>
            <div className="space-y-6 relative z-10">
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-xs text-white/60 mb-1 font-bold">UPSELL TIP</p>
                  <p className="text-sm font-medium leading-relaxed">Consider running a morning discount on your top seller to drive more foot traffic.</p>
               </div>
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-xs text-white/60 mb-1 font-bold">RATING BOOST</p>
                  <p className="text-sm font-medium leading-relaxed">Your average rating is {data?.average_rating}. Try personalizing the order notes to delight customers!</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
