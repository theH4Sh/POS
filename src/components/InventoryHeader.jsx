import { ListFilter, Plus, Upload, Download } from "lucide-react";

export default function InventoryHeader({ onAddProduct, onImport, onExport, isAdmin }) {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 flex flex-wrap items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
          <ListFilter className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">
            Inventory <span className="text-blue-300">Management</span>
          </h3>
          <p className="text-blue-100/70 text-sm mt-1 font-medium">
            Manage your medical stock and product catalog
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={onImport}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all active:scale-95"
              title="Import from Excel"
            >
              <Download className="h-4 w-4 text-blue-300" />
              <span className="text-sm">Import</span>
            </button>
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all active:scale-95 mr-2"
              title="Export to Excel"
            >
              <Upload className="h-4 w-4 text-blue-300" />
              <span className="text-sm">Export</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onAddProduct}
          className="group relative flex items-center gap-2 px-6 py-3.5 bg-white text-blue-900 font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          <div className="bg-blue-100 p-1 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Plus className="h-4 w-4" />
          </div>
          Add New Product
        </button>
      </div>
    </div>
  );
}
