import { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/admin/auth/login/",
        { username, password }
      );

      login(res.data.access);
      navigate("/admin/orders");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-b from-[#eef2f7] via-[#e6ebf3] to-[#dbe3ee]">

      <div
        className="
          w-full max-w-sm
          rounded-[28px] p-8
          bg-[#e8edf4]
          shadow-[0_30px_60px_rgba(0,0,0,0.18)]
        "
      >
        {/* 🔐 HEADER */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="
              w-14 h-14 rounded-full
              bg-teal-600/20
              flex items-center justify-center
            ">
              <span className="text-2xl">🔐</span>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Staff Login
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Authorized access only
          </p>
        </div>

        {/* 👤 USERNAME */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-700">
            Username
          </label>
          <input
            className="
              mt-1 w-full rounded-xl
              bg-[#cfd8e3]
              border border-[#bcc7d6]
              p-3 text-gray-900
              focus:outline-none focus:ring-2 focus:ring-teal-600
            "
            placeholder="Enter username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* 🔑 PASSWORD */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="
              mt-1 w-full rounded-xl
              bg-[#cfd8e3]
              border border-[#bcc7d6]
              p-3 text-gray-900
              focus:outline-none focus:ring-2 focus:ring-teal-600
            "
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* 🚀 LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="
            w-full py-3 rounded-2xl
            bg-teal-700 hover:bg-teal-600
            text-white font-bold tracking-wide
            active:scale-95 transition
          "
        >
          Login →
        </button>

        {/* 🧾 FOOTER */}
        <p className="text-xs text-gray-500 text-center mt-6">
          © Restaurant Staff Panel
        </p>
      </div>
    </div>
  );
}
