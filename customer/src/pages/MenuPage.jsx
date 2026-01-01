import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRestaurantMenu } from "../api/customerApi";
import { useCart } from "../context/CartContext";

export default function MenuPage() {
  const { restaurantId, tableNumber } = useParams();
  const { addToCart, cart, total } = useCart();

  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchRestaurantMenu(restaurantId)
      .then((data) => {
        setMenuData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [restaurantId]);

  if (loading)
    return <p className="p-6 text-center text-white">Loading menu…</p>;
  if (!menuData)
    return <p className="p-6 text-center text-white">Failed to load menu</p>;

  const bestsellerItems = menuData.menu
    .flatMap((cat) => cat.items)
    .filter((item) => Number(item.price) >= 250)
    .slice(0, 5);

  return (
    <div className="max-w-md mx-auto min-h-screen pb-32
      bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-red-50">
      <div className="sticky top-0 z-20 backdrop-blur-md bg-white/10 border-b border-white/10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {menuData.restaurant}
          </h1>
          <p className="text-xs text-red/70">
            🍽 Table {tableNumber} · Dine-In Experience
          </p>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {bestsellerItems.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">🔥 Crowd Favorites</h2>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {bestsellerItems.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[260px] rounded-3xl overflow-hidden
                    bg-white/15 backdrop-blur-lg shadow-xl
                    hover:scale-[1.03] transition-transform"
                >
                  <div className="relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="h-32 bg-black/30 flex items-center justify-center">
                        No Image
                      </div>
                    )}

                    <span className="absolute top-3 left-3 text-xs
                      bg-orange-500 px-3 py-1 rounded-full font-semibold">
                      Bestseller
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-white/70 line-clamp-2 mt-1">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold">
                        ₹{item.price}
                      </span>

                      <button
                        onClick={() => addToCart(item)}
                        className="bg-green-500 hover:bg-green-400
                          text-black font-semibold px-4 py-1.5 rounded-xl
                          active:scale-95 transition"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {menuData.menu.map((category) => (
          <div key={category.id}>
            <h2 className="text-xl font-semibold mb-4 border-l-4 border-green-400 pl-3">
              {category.name}
            </h2>

            {category.items.map((item) => {
              const isVeg =
                item.name.toLowerCase().includes("veg") ||
                item.description.toLowerCase().includes("veg");

              const isJain = item.name.toLowerCase().includes("jain");
              const isBestseller = Number(item.price) >= 250;

              return (
                <div
                  key={item.id}
                  className="mb-5 p-4 rounded-3xl
                    bg-white/10 backdrop-blur-lg shadow-lg
                    hover:bg-white/20 transition"
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {item.name}
                        </h3>

                        {isBestseller && (
                          <span className="text-[10px] bg-orange-500 px-2 rounded-full">
                            Bestseller
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 mt-1">
                        {isVeg && (
                          <span className="text-[10px] bg-green-500 px-2 rounded-full">
                            Veg
                          </span>
                        )}
                        {isJain && (
                          <span className="text-[10px] bg-blue-500 px-2 rounded-full">
                            Jain
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-white/70 mt-2 line-clamp-2">
                        {item.description}
                      </p>

                      <p className="text-xs text-white/50 mt-1">
                        ⏱ Ready in ~15 mins
                      </p>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xl font-bold">
                          ₹{item.price}
                        </span>

                        <button
                          onClick={() => addToCart(item)}
                          className="bg-green-500 hover:bg-green-400
                            text-black font-semibold px-5 py-2 rounded-xl
                            active:scale-95 transition"
                        >
                          ADD +
                        </button>
                      </div>
                    </div>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-2xl object-cover shadow-md"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <div className="max-w-md mx-auto
            bg-green-500 text-black rounded-2xl shadow-2xl
            px-5 py-4 flex justify-between items-center
            animate-pulse">
            <div>
              <p className="font-bold">
                {cart.length} items · ₹{total}
              </p>
              <p className="text-xs opacity-80">
                Ready to place order
              </p>
            </div>

            <Link
              to={`/restaurant/${restaurantId}/table/${tableNumber}/cart`}
              className="bg-black text-white px-5 py-2 rounded-xl font-semibold"
            >
              View Cart →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
