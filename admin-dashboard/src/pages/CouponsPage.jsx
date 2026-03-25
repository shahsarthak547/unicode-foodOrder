import { useEffect, useState } from "react";
import { getCoupons, addCoupon, deleteCoupon } from "../api/adminApi";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Plus, Trash2, Save, Coffee, Percent, IndianRupee } from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    discount_type: "PERCENTAGE",
    value: ""
  });

  const fetchCoupons = async () => {
    try {
      const res = await getCoupons();
      setCoupons(res.data);
    } catch {
      alert("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async () => {
    if (!form.code || !form.value) {
      alert("Please fill all fields");
      return;
    }
    try {
      await addCoupon(form);
      setForm({ code: "", discount_type: "PERCENTAGE", value: "" });
      fetchCoupons();
    } catch (err) {
      alert("Failed to create coupon");
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    try {
      await deleteCoupon(code);
      fetchCoupons();
    } catch {
      alert("Failed to delete coupon");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#D4A373]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] p-8 font-sans selection:bg-[#D4A373]/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-[#4A3B32] p-3 rounded-2xl shadow-lg shadow-[#4A3B32]/20">
            <Ticket className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#4A3B32] tracking-tight">Coupons & Loyalty</h1>
            <p className="text-[#8C7A6B] font-bold uppercase text-[10px] tracking-widest mt-1">Reward your customers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E6D5C3] sticky top-8"
            >
              <h2 className="text-lg font-black text-[#4A3B32] mb-6 flex items-center gap-2 uppercase tracking-wider">
                <Plus size={18} className="text-[#D4A373]" /> Create Promo
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black text-[#8C7A6B] uppercase tracking-widest mb-2 block">Coupon Code</label>
                  <input 
                    type="text" 
                    placeholder="E.G. WELCOME20"
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    className="w-full bg-[#FAF6F0] p-4 rounded-2xl border border-[#E6D5C3] text-[#4A3B32] font-black focus:ring-2 focus:ring-[#D4A373] outline-none transition placeholder:opacity-30"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#8C7A6B] uppercase tracking-widest mb-2 block">Discount Type</label>
                  <select 
                    value={form.discount_type}
                    onChange={e => setForm({...form, discount_type: e.target.value})}
                    className="w-full bg-[#FAF6F0] p-4 rounded-2xl border border-[#E6D5C3] text-[#4A3B32] font-black outline-none focus:ring-2 focus:ring-[#D4A373] appearance-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-[#8C7A6B] uppercase tracking-widest mb-2 block">Value</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={form.value}
                      onChange={e => setForm({...form, value: e.target.value})}
                      className="w-full bg-[#FAF6F0] p-4 rounded-2xl border border-[#E6D5C3] text-[#4A3B32] font-black focus:ring-2 focus:ring-[#D4A373] outline-none transition"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4A373]">
                      {form.discount_type === 'PERCENTAGE' ? <Percent size={20} /> : <IndianRupee size={20} />}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  className="w-full bg-[#D4A373] hover:bg-[#C28E5C] text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl shadow-[#D4A373]/20 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Save Coupon
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {coupons.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-[#E6D5C3] rounded-[40px] p-20 text-center">
                  <Ticket size={64} className="text-[#E6D5C3] mx-auto mb-4" />
                  <p className="text-[#8C7A6B] font-black uppercase tracking-[0.2em]">No active coupons</p>
               </div>
            ) : (
              <AnimatePresence>
                {coupons.map((coupon, i) => (
                  <motion.div
                    key={coupon.code}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-[32px] border border-[#E6D5C3] flex items-center justify-between group hover:shadow-xl hover:shadow-[#4A3B32]/5 transition-all"
                  >
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-[#FAF6F0] rounded-2xl flex items-center justify-center text-[#D4A373] border border-[#E6D5C3] group-hover:scale-110 transition-transform">
                          {coupon.discount_type === 'PERCENTAGE' ? <Percent size={24} /> : <IndianRupee size={24} />}
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-[#4A3B32] tracking-tighter uppercase">{coupon.code}</h3>
                          <p className="text-[#8C7A6B] text-xs font-bold uppercase tracking-widest mt-1">
                             {coupon.discount_type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT OFF`}
                          </p>
                       </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(coupon.code)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                    >
                       <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
