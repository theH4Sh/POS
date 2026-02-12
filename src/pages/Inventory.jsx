import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
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

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

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
