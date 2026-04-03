import { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://10.195.227.158:8000/admin/auth/login/",
        { username, password }
      );

      login(res.data.access, res.data.restaurant_id);
      navigate("/admin/orders");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAF6F0] selection:bg-[#D4A373]/30 relative overflow-hidden">
      
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#D4A373] rounded-full blur-[80px] opacity-20" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#E07A5F] rounded-full blur-[80px] opacity-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-full max-w-sm rounded-[32px] p-8 bg-white shadow-xl shadow-[#4A3B32]/5 relative z-10 border border-[#E6D5C3]"
      >
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-5">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-32 h-32 flex items-center justify-center"
            >
              <img src="/serveflow-logo.png" alt="ServeFlow Logo" className="w-full h-full object-contain" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-extrabold text-[#4A3B32] tracking-tight">
            ServeFlow Portal
          </h2>
          <p className="text-sm text-[#8C7A6B] mt-2 font-medium">
            Authorized cafe access only
          </p>
        </div>

        <div className="mb-5">
          <label className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-2 block">
            Username
          </label>
          <input
            className="w-full rounded-xl bg-[#FAF6F0] border border-[#E6D5C3] p-4 text-[#4A3B32] font-medium outline-none focus:ring-2 focus:ring-[#D4A373] transition placeholder:text-[#8C7A6B]/50"
            placeholder="barista123"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <label className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-2 block">
            Password
          </label>
          <input
            type="password"
            className="w-full rounded-xl bg-[#FAF6F0] border border-[#E6D5C3] p-4 text-[#4A3B32] font-medium outline-none focus:ring-2 focus:ring-[#D4A373] transition placeholder:text-[#8C7A6B]/50"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#D4A373] hover:bg-[#C28E5C] text-white font-bold tracking-wide active:scale-95 transition flex items-center justify-center gap-2 group shadow-lg shadow-[#D4A373]/20 disabled:opacity-70"
        >
          {loading ? "Authenticating..." : (
            <>Secure Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-[#E6D5C3]/50 flex justify-center items-center gap-2 text-xs font-semibold text-[#8C7A6B]">
          <Coffee size={14} /> Byte Brew Admin
        </div>
      </motion.div>
    </div>
  );
}
