import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function OrderStatusPage() {
  const { orderId, restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("PENDING");
  const redirectedRef = useRef(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/orders/${orderId}/`
        );

        setStatus(res.data.status);

        if (
          res.data.status === "COMPLETED" &&
          !redirectedRef.current
        ) {
          redirectedRef.current = true;

          setTimeout(() => {
            navigate(
              `/restaurant/${restaurantId}/table/${tableNumber}`
            );
          }, 8000);
        }
      } catch (err) {
        console.error("Failed to fetch order status");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [orderId, restaurantId, tableNumber, navigate]);

  const steps = [
    { label: "Order Received", done: true },
    { label: "Cooking", done: status !== "COMPLETED" },
    { label: "Ready", done: status === "COMPLETED" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-b from-[#eef2f7] via-[#e6ebf3] to-[#dbe3ee]">

      <div
        className="
          max-w-md w-full rounded-[28px] p-8
          bg-[#e8edf4]
          shadow-[0_30px_60px_rgba(0,0,0,0.18)]
          text-center
        "
      >
        <div className="flex justify-between items-center mb-10 relative">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    font-bold text-sm
                    ${step.done
                      ? "bg-teal-600 text-white"
                      : "bg-[#cfd8e3] text-gray-600"
                    }`}
                >
                  {step.done ? "✓" : index + 1}
                </div>

                <p className="text-xs font-medium text-gray-700 mt-2">
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-[3px]
                    ${steps[index + 1].done
                      ? "bg-teal-600"
                      : "bg-[#cfd8e3]"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        {status === "PENDING" ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="
                w-16 h-16 rounded-full
                bg-teal-600/20
                flex items-center justify-center
                animate-pulse
              ">
                <span className="text-3xl">🍳</span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Preparing your order
            </h1>

            <p className="text-gray-600 leading-relaxed mb-6">
              Please relax at your table while we cook
            </p>
            <div className="w-full bg-[#cfd8e3] rounded-full h-[6px] overflow-hidden mb-2">
              <div className="h-full w-2/3 bg-teal-600 rounded-full animate-pulse" />
            </div>

            <p className="text-xs text-gray-500">
              Checking order status…
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="
                w-16 h-16 rounded-full
                bg-teal-600
                flex items-center justify-center
                animate-[pulse_2s_ease-in-out_infinite]
              ">
                <span className="text-3xl text-white">✓</span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Order Ready!
            </h1>

            <p className="text-gray-600 leading-relaxed mb-3">
              Please collect your order from the counter
            </p>

            <p className="text-sm text-gray-500">
              Redirecting you back to the menu…
            </p>
          </>
        )}
        <div className="mt-10 pt-4 border-t border-gray-300/40">
          <p className="text-xs text-gray-500">Order ID</p>
          <p className="font-semibold text-gray-800">
            #{orderId}
          </p>
        </div>
      </div>
    </div>
  );
}
