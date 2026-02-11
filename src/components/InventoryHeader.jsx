import { ListFilter, Plus } from "lucide-react";

export default function InventoryHeader({ onAddProduct }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 className="text-3xl font-bold text-white flex items-center gap-3">
          <ListFilter className="h-8 w-8" /> Inventory Management
        </h3>
        <p className="text-blue-100 text-sm mt-2">
          View and manage your product inventory
        </p>
      </div>
      <button
        type="button"
        onClick={onAddProduct}
        className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
      >
        <Plus className="h-5 w-5" /> Add Product
      </button>
    </div>
  );
}
