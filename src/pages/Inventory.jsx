import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CheckCircle2, AlertTriangle, XCircle, Boxes } from "lucide-react";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
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

  const isAdmin = user?.role === "admin";

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

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-stock" && p.stock >= 20) ||
      (statusFilter === "low-stock" && p.stock > 0 && p.stock < 20) ||
      (statusFilter === "out-of-stock" && p.stock === 0);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock >= 20).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 20).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  const handleDelete = async (product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        await window.api.deleteMedicine(product.id);
        load(); // Reload the list
      } catch (err) {
        console.error("Failed to delete product:", err);
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white overflow-hidden transition-all duration-500">
          <InventoryHeader onAddProduct={() => setShowAddModal(true)} />

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
                    }`}>Total Items</p>
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

            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <InventorySearch value={search} onChange={setSearch} />
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
    </div>
  );
};

export default Inventory;
