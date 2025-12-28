import { useState, useEffect } from "react";

export default function MenuForm({ onSubmit, initialData, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    is_available: true,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="bg-gray-100 p-4 rounded mb-4">
      <input
        name="name"
        placeholder="Item name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <input
        name="price"
        placeholder="Price"
        type="number"
        value={form.price}
        onChange={handleChange}
      />

      <label>
        <input
          type="checkbox"
          name="is_available"
          checked={form.is_available}
          onChange={handleChange}
        />
        Available
      </label>

      <div>
        <button onClick={() => onSubmit(form)}>Save</button>
        {onCancel && <button onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
