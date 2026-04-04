import { useEffect, useState } from "react";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadCSV,
} from "../api/adminApi";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Edit2, Trash2, Upload, Plus, Save, FileSpreadsheet } from "lucide-react";

export default function MenuManagementPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
    stock_quantity: 0,
    track_inventory: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  const fetchMenu = async () => {
    try {
      const res = await getMenu();
      setMenu(res.data);
    } catch (err) {
      alert("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      alert("Name, price & category are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", Number(form.price));
    formData.append("category", Number(form.category));
    formData.append("is_available", "true");
    formData.append("stock_quantity", Number(form.stock_quantity));
    formData.append("track_inventory", form.track_inventory);

    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
        await updateMenuItem(editingId, formData);
      } else {
        await addMenuItem(formData);
      }

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
        stock_quantity: 0,
        track_inventory: false,
      });
      setEditingId(null);
      fetchMenu();
    } catch (err) {
      alert("Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      image: null,
      stock_quantity: item.stock_quantity,
      track_inventory: item.track_inventory,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item permanently?")) return;

    try {
      await deleteMenuItem(id);
      fetchMenu();
    } catch {
      alert("Failed to delete item");
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert("Select a CSV file first");
      return;
    }

    try {
      await uploadCSV(csvFile);
      setCsvFile(null);
      fetchMenu();
    } catch {
      alert("CSV upload failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F0]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mb-4 text-[#D4A373]">
            <Coffee size={40} />
        </motion.div>
        <p className="text-[#8C7A6B] font-medium tracking-wide">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] p-6 selection:bg-[#D4A373]/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/serveflow-logo.png" alt="ServeFlow Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#4A3B32]">Menu Editor</h1>
            <p className="text-sm font-medium text-[#8C7A6B]">Manage your cafe offerings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E6D5C3]"
            >
              <h2 className="text-lg font-bold text-[#4A3B32] mb-5 flex items-center gap-2">
                {editingId ? <Edit2 size={18} className="text-[#D4A373]" /> : <Plus size={18} className="text-[#D4A373]" />}
                {editingId ? "Edit Item" : "Create New Item"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5 block">Item Name *</label>
                  <input
                    placeholder="e.g. Mocha Frappe"
                    className="w-full bg-[#FAF6F0] p-3 rounded-xl border border-[#E6D5C3] text-[#4A3B32] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5 block">Price (₹) *</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-[#FAF6F0] p-3 rounded-xl border border-[#E6D5C3] text-[#4A3B32] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5 block">Category ID *</label>
                    <input
                      type="number"
                      placeholder="1"
                      className="w-full bg-[#FAF6F0] p-3 rounded-xl border border-[#E6D5C3] text-[#4A3B32] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea
                    placeholder="A delicious treat..."
                    rows={3}
                    className="w-full bg-[#FAF6F0] p-3 rounded-xl border border-[#E6D5C3] text-[#4A3B32] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition resize-none"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-4 bg-[#FAF6F0] p-4 rounded-xl border border-[#E6D5C3]">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5 block">Stock Level</label>
                    <input
                      type="number"
                      className="w-full bg-white p-2 rounded-lg border border-[#E6D5C3] text-[#4A3B32] font-bold"
                      value={form.stock_quantity}
                      onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="track_inv"
                      className="w-5 h-5 accent-[#D4A373]"
                      checked={form.track_inventory}
                      onChange={(e) => setForm({ ...form, track_inventory: e.target.checked })}
                    />
                    <label htmlFor="track_inv" className="text-xs font-bold text-[#4A3B32] uppercase tracking-widest cursor-pointer">Track Inventory</label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1.5 block">Image</label>
                  <div className="w-full bg-[#FAF6F0] p-2 rounded-xl border border-[#E6D5C3] border-dashed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D4A373] file:text-white hover:file:bg-[#C28E5C] transition-colors text-sm text-[#8C7A6B]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-[#D4A373] hover:bg-[#C28E5C] text-white px-4 py-3 rounded-xl font-bold active:scale-95 transition shadow-sm flex justify-center items-center gap-2"
                  >
                    <Save size={18} />
                    {editingId ? "Update" : "Save Item"}
                  </button>
                  
                  {editingId && (
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setForm({ name: "", description: "", price: "", category: "", image: null });
                      }}
                      className="px-4 py-3 bg-[#FAF6F0] hover:bg-[#E6D5C3] text-[#8C7A6B] font-bold rounded-xl transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E6D5C3]"
            >
              <h2 className="text-lg font-bold text-[#4A3B32] mb-4 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#D4A373]" />
                Bulk CSV Upload
              </h2>

              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="w-full bg-[#FAF6F0] p-2 rounded-xl border border-[#E6D5C3] border-dashed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4A3B32] file:text-white transition-colors text-sm text-[#8C7A6B]"
                />
                <button
                  onClick={handleCSVUpload}
                  disabled={!csvFile}
                  className="bg-[#4A3B32] hover:bg-[#3A2D25] text-white px-4 py-3 rounded-xl font-bold active:scale-95 transition shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  <Upload size={18} />
                  Import CSV
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {menu.length === 0 ? (
              <div className="bg-white border border-[#E6D5C3] rounded-[24px] p-12 text-center flex flex-col items-center justify-center">
                <Coffee size={48} className="text-[#D4A373]/30 mb-4" />
                <p className="text-xl font-bold text-[#4A3B32]">Your menu is empty</p>
                <p className="text-[#8C7A6B]">Add your first delicious item above.</p>
              </div>
            ) : (
              <AnimatePresence>
                {menu.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                    className={`bg-white p-5 rounded-[24px] shadow-sm border transition-shadow flex items-center gap-5 ${editingId === item.id ? 'border-[#D4A373] ring-2 ring-[#D4A373]/20' : 'border-[#E6D5C3]'}`}
                  >
                    <div className="w-24 h-24 shrink-0 rounded-[16px] bg-[#FAF6F0] overflow-hidden flex items-center justify-center border border-[#E6D5C3]/50">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Coffee size={32} className="text-[#8C7A6B]/30" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-[#D4A373] mb-1">
                            ₹{item.price} <span className="text-[#8C7A6B] font-medium text-xs ml-2">CAT ID: {item.category}</span>
                          </p>
                          {item.track_inventory && (
                            <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded inline-block ${item.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of Stock'}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FAF6F0] hover:bg-[#D4A373] text-[#8C7A6B] hover:text-white transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FAF6F0] hover:bg-red-500 text-[#8C7A6B] hover:text-white transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#8C7A6B] line-clamp-2 mt-2 leading-relaxed">
                        {item.description || "No description provided."}
                      </p>
                    </div>
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
