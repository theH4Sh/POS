import { useState } from "react";
import { Plus, Save, X } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none";
const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

const INITIAL_FORM = {
  name: "",
  barcode: "",
  quantity: "",
  purchasePrice: "",
  salePrice: "",
  description: "",
  category: "medicine",
};

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);

  if (!isOpen) return null;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const reset = () => setForm(INITIAL_FORM);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await window.api.addMedicine({
      name: form.name,
      barcode: form.barcode,
      quantity: parseInt(form.quantity) || 0,
      category: form.category,
      purchasePrice: form.purchasePrice,
      salePrice: form.salePrice,
      description: form.description,
    });
    reset();
    onClose();
    onSuccess?.();
    alert("Product added successfully");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="h-6 w-6" /> Add New Product
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Product Name *</label>
            <input
              className={inputClass}
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Barcode</label>
            <input
              className={inputClass}
              placeholder="Enter or scan barcode"
              value={form.barcode}
              onChange={(e) => update("barcode", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantity *</label>
              <input
                className={inputClass}
                placeholder="0"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                required
              >
                <option value="medicine">Medicine</option>
                <option value="cosmetics">Cosmetics</option>
                <option value="supplements">Supplements</option>
                <option value="medical-devices">Medical Devices</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Purchase Price</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-gray-500 font-semibold">$</span>
                <input
                  className={`${inputClass} pl-8`}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={form.purchasePrice}
                  onChange={(e) => update("purchasePrice", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Sale Price</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-gray-500 font-semibold">$</span>
                <input
                  className={`${inputClass} pl-8`}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) => update("salePrice", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} resize-none py-3`}
              placeholder="Add product description, ingredients, usage instructions, etc."
              rows="3"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" /> Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
