import { useEffect, useState } from "react";
import AddProductModal from "../components/AddProductModal";
import EditStockModal from "../components/EditStockModal";
import InventoryHeader from "../components/InventoryHeader";
import InventorySearch from "../components/InventorySearch";
import InventoryTable from "../components/InventoryTable";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = async () => {
    const medicines = await window.api.listMedicines();
    const formatted = medicines.map((m) => {
      const stock = m.quantity || 0;
      const status =
        stock === 0 ? "Out of Stock" : stock < 20 ? "Low Stock" : "In Stock";
      return { ...m, stock, status };
    });
    setProducts(formatted);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  const editingProduct = editingId
    ? products.find((p) => p.id === editingId)
    : null;

  const handleSaveStock = async (productId, quantity) => {
    await window.api.updateStock({ id: productId, quantity });
    setEditingId(null);
    load();
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
              onEditStock={(id, stock) => {
                setEditingId(id);
              }}
            />
          </div>
        </div>
      </div>

      <EditStockModal
        key={editingId}
        isOpen={!!editingId}
        productName={editingProduct?.name}
        initialQuantity={editingProduct?.stock}
        onClose={() => setEditingId(null)}
        onSave={async (quantity) => {
          if (editingId) await handleSaveStock(editingId, quantity);
        }}
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
