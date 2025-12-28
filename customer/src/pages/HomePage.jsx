import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRestaurantDetails } from "../api/customerApi";
export default function HomePage() {
    const { restaurantId, tableNumber } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const activeOrderId = localStorage.getItem("activeOrderId");
        if (activeOrderId) {
            navigate(
                `/restaurant/${restaurantId}/table/${tableNumber}/order-status/${activeOrderId}`
            );
        }
        fetchRestaurantDetails(restaurantId)
        .then((data) => {
            setRestaurant(data);
            setLoading(false);
        });
    }, [restaurantId]);

    if (loading) {
        return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4">Loading...</div>;
    }

    if(!restaurant) {
        return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4">Restaurant not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4">
        
        {/* Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">

            {/* Decorative gradient blob */}
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-200 rounded-full blur-3xl opacity-40"></div>

            {/* Logo / Icon */}
            <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl shadow">
                ☕
            </div>
            </div>

            {/* Restaurant Name */}
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome to {restaurant.name}
            </h1>

            {/* Tagline */}
            <p className="mt-2 text-sm text-gray-500 italic">
            {restaurant?.tagline || "Where taste meets technology"}
            </p>

            {/* Divider */}
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            {/* Table Info */}
            <div className="text-sm text-gray-600">
            You are seated at
            </div>
            <div className="mt-1 text-xl font-bold text-amber-600">
            Table {tableNumber}
            </div>

            {/* CTA */}
            <button
            onClick={() =>
                navigate(`/restaurant/${restaurantId}/table/${tableNumber}/menu`)
            }
            className="mt-8 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
            View Menu 🍽
            </button>

            {/* Helper Text */}
            <p className="mt-5 text-xs text-gray-400">
            Scan → Order → Enjoy 🍕
            </p>

            {/* Footer */}
            <div className="mt-10 text-[11px] text-gray-300">
            © 2025 {restaurant?.name || "Byte Brew"} • Crafted with ❤️ & caffeine
            </div>
        </div>
        </div>
    );
}
