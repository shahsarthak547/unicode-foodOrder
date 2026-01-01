import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../api/adminApi";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id) => {
    try {
      await updateOrderStatus(id, "COMPLETED");
      fetchOrders();
    } catch {
      alert("Failed to update status");
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center
        bg-gradient-to-b from-[#eef2f7] to-[#dbe3ee]">
        <p className="text-gray-600">Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen
      bg-gradient-to-b from-[#eef2f7] via-[#e6ebf3] to-[#dbe3ee]
      px-4 py-6">

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Live Orders
            </h1>
            <p className="text-sm text-gray-600">
              Kitchen & counter management
            </p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="
              rounded-xl px-4 py-2
              bg-[#cfd8e3]
              border border-[#bcc7d6]
              text-gray-900
              focus:outline-none focus:ring-2 focus:ring-teal-600
            "
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center
            bg-[#e8edf4]
            rounded-3xl p-12
            shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-semibold text-gray-800">
              No orders found
            </p>
            <p className="text-sm text-gray-600">
              Waiting for customers to place orders
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const total = order.items.reduce(
                (sum, item) =>
                  sum +
                  Number(item.price_at_order) * item.quantity,
                0
              );

              const isPending = order.status === "PENDING";

              return (
                <div
                  key={order.id}
                  className={`
                    rounded-3xl p-5
                    shadow-[0_15px_35px_rgba(0,0,0,0.15)]
                    transition
                    ${isPending
                      ? "bg-[#fdecec] border-l-8 border-red-400"
                      : "bg-[#e7f5ec] border-l-8 border-green-500"}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Order #{order.id}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Table {order.table_number}
                      </p>
                    </div>

                    <span
                      className={`
                        px-4 py-1 rounded-full text-sm font-semibold
                        ${isPending
                          ? "bg-red-200 text-red-800"
                          : "bg-green-200 text-green-800"}
                      `}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm text-gray-800"
                      >
                        <span>
                          {item.menu_item_name} × {item.quantity}
                        </span>
                        <span>
                          ₹{item.price_at_order}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-900">
                      Total: ₹{total}
                    </p>

                    {isPending && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id)
                        }
                        className="
                          bg-teal-700 hover:bg-teal-600
                          text-white px-5 py-2 rounded-2xl
                          font-bold tracking-wide
                          active:scale-95 transition
                        "
                      >
                        Mark Ready →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
