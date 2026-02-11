import { useState } from "react";
import { X } from "lucide-react";

export default function EditStockModal({
  isOpen,
  productName,
  initialQuantity,
  onClose,
  onSave,
}) {
  const [quantity, setQuantity] = useState(String(initialQuantity ?? ""));

  if (!isOpen) return null;

  const handleSave = async () => {
    await onSave(Number(quantity));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Update Stock</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold text-gray-900">{productName}</span>
          </p>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Quantity
          </label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg font-semibold"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
