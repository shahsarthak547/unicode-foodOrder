import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRestaurantMenu } from "../api/customerApi";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Flame, Plus, ChevronRight, ShoppingBag } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mb-4 text-[#D4A373]">
          <Coffee size={40} />
        </motion.div>
        <p className="text-[#8C7A6B] font-medium tracking-wide">Waking up the barista...</p>
      </div>
    );
    
  if (!menuData)
    return <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center text-[#4A3B32]">Failed to load menu</div>;

  const bestsellerItems = menuData.menu
    .flatMap((cat) => cat.items)
    .filter((item) => Number(item.price) >= 250)
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-32 bg-[#FAF6F0] selection:bg-[#D4A373]/30">
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#FAF6F0]/85 border-b border-[#E6D5C3]">
        <div className="px-5 py-5 flex items-center gap-3">
          <img src="/serveflow-logo.png" alt="ServeFlow Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-[#4A3B32]">
                {menuData.restaurant}
            </h1>
            <p className="text-xs text-[#8C7A6B] font-medium tracking-wide mt-1">
                TABLE {tableNumber} · DINE-IN
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-8">
        {bestsellerItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <Flame size={20} className="text-[#E07A5F]" />
              <h2 className="text-xl font-bold text-[#4A3B32]">Cafe Favorites</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {bestsellerItems.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.id}
                  className="min-w-[240px] snap-center rounded-[24px] overflow-hidden bg-white shadow-sm border border-[#E6D5C3]"
                >
                  <div className="relative h-36 bg-[#E6D5C3]/40">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#8C7A6B]/50">
                        <Coffee size={32} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider bg-[#E07A5F] text-white px-3 py-1.5 rounded-full shadow-sm">
                      Popular
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-[#4A3B32] mb-1">{item.name}</h3>
                    <p className="text-xs text-[#8C7A6B] line-clamp-2 min-h-[32px] mb-3">
                      {item.description || "A cafe classic crafted to perfection."}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-[#4A3B32]">
                        ₹{item.price}
                      </span>
                      {(!item.track_inventory || item.stock_quantity > 0) && item.is_available ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-[#D4A373] hover:bg-[#C28E5C] text-white p-2 rounded-full shadow-md shadow-[#D4A373]/30 transition group"
                        >
                          <Plus size={18} className="group-active:rotate-90 transition-transform" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          {menuData.menu.map((category) => (
            <div key={category.id}>
              <h2 className="text-lg font-extrabold text-[#4A3B32] mb-4 uppercase tracking-wider flex items-center gap-3">
                <span className="w-8 h-[2px] bg-[#D4A373]" />
                {category.name}
              </h2>

              <div className="space-y-4">
                {category.items.map((item) => {
                  const isVeg = item.name.toLowerCase().includes("veg") || item.description.toLowerCase().includes("veg");
                  const isBestseller = Number(item.price) >= 250;

                  return (
                    <motion.div
                      variants={itemVariants}
                      key={item.id}
                      className="bg-white rounded-[20px] p-4 shadow-sm border border-[#E6D5C3] flex gap-4 relative overflow-hidden group"
                    >
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {isVeg && (
                              <div className="w-3 h-3 rounded-full border border-green-600 flex items-center justify-center p-[2px]">
                                <div className="w-full h-full bg-green-600 rounded-full" />
                              </div>
                            )}
                            {isBestseller && (
                              <span className="text-[9px] uppercase tracking-wider bg-[#E07A5F]/10 text-[#E07A5F] px-2 py-0.5 rounded-sm font-bold">
                                Bestseller
                              </span>
                            )}
                          </div>
                          
                          <h3 className="font-bold text-[#4A3B32] text-lg leading-tight mb-1">
                            {item.name}
                          </h3>
                          
                          <p className="text-xs text-[#8C7A6B] line-clamp-2 mb-3">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-lg font-black text-[#4A3B32]">
                            ₹{item.price}
                          </span>

                          {(!item.track_inventory || item.stock_quantity > 0) && item.is_available ? (
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-[#FAF6F0] hover:bg-[#D4A373] text-[#D4A373] hover:text-white border border-[#D4A373] hover:border-transparent font-medium px-4 py-1.5 rounded-full text-sm transition-all focus:scale-95"
                            >
                              Add
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-red-500 uppercase px-3 py-1 bg-red-50 rounded-full">Unavailable</span>
                          )}
                        </div>
                      </div>

                      {item.image && (
                        <div className="w-28 h-28 shrink-0 rounded-[16px] overflow-hidden bg-[#E6D5C3]/30">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto"
          >
            <Link
              to={`/restaurant/${restaurantId}/table/${tableNumber}/cart`}
              className="bg-[#4A3B32] text-white rounded-2xl shadow-xl shadow-[#4A3B32]/30 px-6 py-4 flex justify-between items-center group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/5 w-0 group-hover:w-full transition-all duration-300" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-[#D4A373] w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#4A3B32] shadow-inner">
                  {cart.length}
                </div>
                <div>
                  <p className="text-sm text-white/70 font-medium">Total</p>
                  <p className="font-extrabold text-lg tracking-wide">₹{total}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-bold text-[#D4A373] relative z-10">
                View Cart <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
