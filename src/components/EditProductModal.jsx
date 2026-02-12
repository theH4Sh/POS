import { useState } from "react";
import { Save, SquarePen, X, Barcode } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none";

function formFromProduct(product) {
  if (!product) {
    return {
      name: "",
      barcode: "",
      quantity: "",
      purchasePrice: "",
      salePrice: "",
      description: "",
      category: "medicine",
    };
  }
  return {
    name: product.name ?? "",
    barcode: product.barcode ?? "",
    quantity: product.stock ?? product.quantity ?? "",
    purchasePrice: product.purchasePrice ?? "",
    salePrice: product.salePrice ?? "",
    description: product.description ?? "",
    category: product.category ?? "medicine",
  };
}

export default function EditProductModal({ isOpen, product, onClose, onSuccess }) {
  const [form, setForm] = useState(() => formFromProduct(product));



  if (!isOpen) return null;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleClose = () => onClose();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await window.api.updateMedicine({
        id: product.id,
        name: form.name,
        barcode: form.barcode,
        quantity: parseInt(form.quantity, 10) || 0,
        category: form.category,
        purchasePrice: form.purchasePrice,
        salePrice: form.salePrice,
        description: form.description,
      });
      onClose();
      onSuccess?.();
      alert("Product updated successfully");
    } catch (err) {
      alert(err?.message || "Failed to update product");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-100 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <SquarePen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Update <span className="text-blue-200">Product</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">Product Name *</label>
                <input
                  className={`${inputClass} !bg-white !border-gray-200 focus:!border-blue-500`}
                  placeholder="Enter full product name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">Barcode</label>
                <div className="relative">
                  <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    className={`${inputClass} pl-10 !bg-white !border-gray-200 focus:!border-blue-500 font-mono`}
                    placeholder="Scan or enter barcode"
                    value={form.barcode}
                    onChange={(e) => update("barcode", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">Category *</label>
                <select
                  className={`${inputClass} !bg-white !border-gray-200 focus:!border-blue-500`}
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
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Pricing & Inventory</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">Stock Qty *</label>
                <input
                  className={`${inputClass} !bg-white !border-gray-200 focus:!border-blue-500 text-center font-bold`}
                  placeholder="0"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">Buy Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                  <input
                    className={`${inputClass} pl-8 !bg-white !border-gray-200 focus:!border-blue-500 font-mono`}
                    placeholder="0"
                    type="number"
                    step="1"
                    value={form.purchasePrice}
                    onChange={(e) => update("purchasePrice", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">Sell Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 font-bold">Rs</span>
                  <input
                    className={`${inputClass} pl-8 !bg-blue-50/50 !border-blue-100 focus:!border-blue-500 font-mono text-blue-700 font-bold`}
                    placeholder="0"
                    type="number"
                    step="1"
                    value={form.salePrice}
                    onChange={(e) => update("salePrice", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Additional Details</h4>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">Description</label>
              <textarea
                className={`${inputClass} resize-none py-3 !bg-white !border-gray-200 focus:!border-blue-500`}
                placeholder="Enter detailed description, ingredients, usage instructions, etc..."
                rows="3"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] h-12 rounded-xl bg-blue-700 text-white font-black hover:bg-blue-800 shadow-xl shadow-blue-500/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
