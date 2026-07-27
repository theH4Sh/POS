import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CheckCircle2, AlertTriangle, XCircle, Boxes, Trash2 } from "lucide-react";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import FormulaManagerModal from "../components/FormulaManagerModal";
import InventoryHeader from "../components/InventoryHeader";
import InventorySearch from "../components/InventorySearch";
import InventoryTable from "../components/InventoryTable";

const Inventory = () => {
  const { user } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'in-stock', 'low-stock', 'out-of-stock'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFormulaManager, setShowFormulaManager] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const isAdmin = user?.role === "admin";

  // Escape key to close delete confirmation
  useEffect(() => {
    if (!deletingProduct) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setDeletingProduct(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [deletingProduct]);

  const load = useCallback(async () => {
    const medicines = await window.api.listMedicines();
    const formatted = medicines.map((m) => {
      const stock = m.quantity || 0;
      const status =
        stock === 0 ? "Out of Stock" : stock < 20 ? "Low Stock" : "In Stock";
      return { ...m, stock, status };
    });
    setProducts(formatted);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Shortcut: Alt + A to open Add Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setShowAddModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)) ||
      (p.formulaName && p.formulaName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-stock" && p.stock >= 20) ||
      (statusFilter === "low-stock" && p.stock > 0 && p.stock < 20) ||
      (statusFilter === "out-of-stock" && p.stock === 0);

    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock >= 20).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 20).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    categories: {
      medicine: products.filter((p) => p.category === "medicine").length,
      cosmetics: products.filter((p) => p.category === "cosmetics").length,
      supplements: products.filter((p) => p.category === "supplements").length,
      "medical-devices": products.filter((p) => p.category === "medical-devices").length,
      others: products.filter((p) => p.category === "others").length,
    }
  };

  const handleDelete = (product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await window.api.deleteMedicine(deletingProduct.id);
      toast.success(`"${deletingProduct.name}" deleted`);
      setDeletingProduct(null);
      load();
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product");
      setDeletingProduct(null);
    }
  };

  const handleImport = async () => {
    const result = await window.api.importInventory();
    if (result.success) {
      toast.success(result.message);
      load();
    } else if (result.message !== "Import cancelled") {
      toast.error(result.message);
    }
  };

  const handleExport = async () => {
    const result = await window.api.exportInventory();
    if (result.success) {
      toast.success("Inventory exported successfully!");
    } else if (result.message !== "Export cancelled") {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white overflow-hidden transition-all duration-500">
          <InventoryHeader
            onAddProduct={() => setShowAddModal(true)}
            onImport={handleImport}
            onExport={handleExport}
            onManageFormulas={() => setShowFormulaManager(true)}
            isAdmin={isAdmin}
          />

          <div className="p-8 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setStatusFilter("all")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${statusFilter === "all" ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-200" : "bg-white border-gray-100 hover:border-blue-200"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase tracking-widest ${statusFilter === "all" ? "text-blue-100" : "text-gray-400"
                    }`}>Total Products</p>
                  <Boxes className={`h-5 w-5 ${statusFilter === "all" ? "text-blue-200" : "text-blue-500"}`} />
                </div>
                <p className={`text-3xl font-black mt-1 ${statusFilter === "all" ? "text-white" : "text-gray-900"
                  }`}>{stats.total}</p>
              </button>

              <button
                onClick={() => setStatusFilter("in-stock")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${statusFilter === "in-stock" ? "bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-100" : "bg-white border-gray-100 hover:border-emerald-200"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase tracking-widest ${statusFilter === "in-stock" ? "text-emerald-100" : "text-gray-400"
                    }`}>In Stock</p>
                  <CheckCircle2 className={`h-5 w-5 ${statusFilter === "in-stock" ? "text-emerald-200" : "text-emerald-500"}`} />
                </div>
                <p className={`text-3xl font-black mt-1 ${statusFilter === "in-stock" ? "text-white" : "text-gray-900"
                  }`}>{stats.inStock}</p>
              </button>

              <button
                onClick={() => setStatusFilter("low-stock")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${statusFilter === "low-stock" ? "bg-amber-500 border-amber-500 shadow-lg shadow-amber-100" : "bg-white border-gray-100 hover:border-amber-200"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase tracking-widest ${statusFilter === "low-stock" ? "text-amber-50" : "text-gray-400"
                    }`}>Low Stock</p>
                  <AlertTriangle className={`h-5 w-5 ${statusFilter === "low-stock" ? "text-amber-100" : "text-amber-500"}`} />
                </div>
                <p className={`text-3xl font-black mt-1 ${statusFilter === "low-stock" ? "text-white" : "text-gray-900"
                  }`}>{stats.lowStock}</p>
              </button>

              <button
                onClick={() => setStatusFilter("out-of-stock")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${statusFilter === "out-of-stock" ? "bg-rose-600 border-rose-600 shadow-lg shadow-rose-200" : "bg-white border-gray-100 hover:border-rose-200"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase tracking-widest ${statusFilter === "out-of-stock" ? "text-rose-100" : "text-gray-400"
                    }`}>Out of Stock</p>
                  <XCircle className={`h-5 w-5 ${statusFilter === "out-of-stock" ? "text-rose-200" : "text-rose-500"}`} />
                </div>
                <p className={`text-3xl font-black mt-1 ${statusFilter === "out-of-stock" ? "text-white" : "text-gray-900"
                  }`}>{stats.outOfStock}</p>
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-end bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex-1 w-full">
                <InventorySearch value={search} onChange={setSearch} />
              </div>

              <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black uppercase text-gray-400 px-3 tracking-widest border-r border-gray-100 mr-1 shrink-0">Category</span>
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${categoryFilter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  All
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${categoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{stats.total}</span>
                </button>
                <button
                  onClick={() => setCategoryFilter("medicine")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${categoryFilter === 'medicine' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Medicine
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${categoryFilter === 'medicine' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{stats.categories.medicine}</span>
                </button>
                <button
                  onClick={() => setCategoryFilter("cosmetics")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${categoryFilter === 'cosmetics' ? 'bg-pink-600 text-white shadow-md shadow-pink-100' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Cosmetics
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${categoryFilter === 'cosmetics' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{stats.categories.cosmetics}</span>
                </button>
                <button
                  onClick={() => setCategoryFilter("supplements")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${categoryFilter === 'supplements' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Supplements
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${categoryFilter === 'supplements' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{stats.categories.supplements}</span>
                </button>
                <button
                  onClick={() => setCategoryFilter("medical-devices")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${categoryFilter === 'medical-devices' ? 'bg-amber-600 text-white shadow-md shadow-amber-100' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Equipment
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${categoryFilter === 'medical-devices' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{stats.categories["medical-devices"]}</span>
                </button>
                <button
                  onClick={() => setCategoryFilter("others")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${categoryFilter === 'others' ? 'bg-gray-600 text-white shadow-md shadow-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Others
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${categoryFilter === 'others' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{stats.categories.others}</span>
                </button>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <InventoryTable
                products={filteredProducts}
                onEditProduct={setEditingProduct}
                onDeleteProduct={handleDelete}
                canEdit={isAdmin}
              />
            </div>
          </div>
        </div>
      </div>

      <EditProductModal
        key={editingProduct?.id}
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={load}
      />

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={load}
      />

      {isAdmin && (
        <FormulaManagerModal
          isOpen={showFormulaManager}
          onClose={() => setShowFormulaManager(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-100 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2.5 rounded-xl">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Delete Product</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deletingProduct.name}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 h-11 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
