import { Search } from "lucide-react";

export default function InventorySearch({ value, onChange }) {
  return (
    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
      <Search className="h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search by product name or barcode..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
      />
    </div>
  );
}
