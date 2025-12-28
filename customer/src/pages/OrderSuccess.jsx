import { useSearchParams, useParams, Link } from "react-router-dom";
import { useEffect } from "react";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { restaurantId, tableNumber } = useParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // Optional auto-redirect after 15 sec
    // setTimeout(() => {
    //   window.location.href = `/restaurant/${restaurantId}/table/${tableNumber}`;
    // }, 15000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">

        {/* Animated Check */}
        <div className="text-green-600 text-5xl mb-4 animate-bounce">
          ✅
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Order Placed!
        </h1>

        <p className="text-gray-600 mb-4">
          We’ve received your order and started preparing it 🍽️
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-4 text-left">
          <p className="text-sm">
            <span className="font-semibold">Order ID:</span> #{orderId}
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Estimated Time:</span> 15–20 mins
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></span>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Please stay seated. Our staff will serve you at your table.
        </p>

        <Link
          to={`/restaurant/${restaurantId}/table/${tableNumber}`}
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          Back to Menu
        </Link>
      </div>
    </div>
  );
}
