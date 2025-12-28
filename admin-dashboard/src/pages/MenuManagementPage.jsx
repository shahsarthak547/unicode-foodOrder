import { useEffect, useState } from "react";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadCSV,
} from "../api/adminAPI";

export default function MenuManagementPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });

  const [editingId, setEditingId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  /* ================= FETCH MENU ================= */
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

  /* ================= ADD / UPDATE ================= */
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

    // 🔥 CRITICAL: always keep item visible for customers
    formData.append("is_available", "true");

    // 🔥 Only send image if selected
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
      });
      setEditingId(null);
      fetchMenu();
    } catch (err) {
      alert("Failed to save item");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      image: null, // keep old image unless replaced
    });
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await deleteMenuItem(id);
      fetchMenu();
    } catch {
      alert("Failed to delete item");
    }
  };

  /* ================= CSV ================= */
  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert("Select a CSV file");
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
    return <p className="p-6 text-center">Loading menu…</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Menu Management</h1>

      {/* ================= ADD / EDIT FORM ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <h2 className="font-semibold mb-3">
          {editingId ? "Edit Item" : "Add New Item"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            placeholder="Name"
            className="border p-2 rounded"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Category ID"
            className="border p-2 rounded"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />

          <input
            placeholder="Description"
            className="border p-2 rounded"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <input
            type="file"
            accept="image/*"
            className="border p-2 rounded"
            onChange={(e) =>
              setForm({ ...form, image: e.target.files[0] })
            }
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          {editingId ? "Update Item" : "Add Item"}
        </button>
      </div>

      {/* ================= CSV UPLOAD ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <h2 className="font-semibold mb-3">Bulk Upload (CSV)</h2>

        <div className="flex gap-3 items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
          />
          <button
            onClick={handleCSVUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Upload CSV
          </button>
        </div>
      </div>

      {/* ================= MENU LIST ================= */}
      <div className="space-y-4">
        {menu.length === 0 ? (
          <p className="text-gray-500">No menu items</p>
        ) : (
          menu.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between gap-4"
            >
              <div className="flex gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 object-cover rounded"
                  />
                )}

                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    ₹{item.price} · Category {item.category}
                  </p>
                  <p className="text-sm">{item.description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1 border rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 border text-red-600 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
