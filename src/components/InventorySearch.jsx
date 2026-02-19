import { Search } from "lucide-react";

export default function InventorySearch({ value, onChange }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search by name, barcode, or formula..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 pl-12 pr-4 bg-white border-2 border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 font-medium"
      />
    </div>
  );
}
