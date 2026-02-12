import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
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
        alert("Failed to delete product");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-xl bg-white shadow-xl overflow-hidden">
          <InventoryHeader onAddProduct={() => setShowAddModal(true)} />

          <div className="p-6 space-y-4">
            <InventorySearch value={search} onChange={setSearch} />
            <InventoryTable
              products={filteredProducts}
              onEditProduct={setEditingProduct}
              onDeleteProduct={handleDelete}
              canEdit={isAdmin}
            />
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
