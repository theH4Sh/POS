import { ListFilter, Search, SquarePen, TriangleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");

  const load = async () => {
    const medicines = await window.api.listMedicines();

    const formatted = medicines.map((m) => {
      const stock = m.quantity || 0;

      // Status logic
      const status =
        stock === 0 ? "Out of Stock" : stock < 20 ? "Low Stock" : "In Stock";

      return {
        ...m,
        stock,
        status,
      };
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-xl bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
              <ListFilter className="h-8 w-8" /> Inventory Management
            </h3>
            <p className="text-blue-100 text-sm mt-2">View and manage your product inventory</p>
          </div>

          {/* Search */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-600">Barcode</th>
                    <th className="p-4 text-left font-semibold text-gray-600">Product Name</th>
                    <th className="p-4 text-left font-semibold text-gray-600">Category</th>
                    <th className="p-4 text-left font-semibold text-gray-600">Purchase / Sale Price</th>
                    <th className="p-4 text-left font-semibold text-gray-600">Stock</th>
                    <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                    <th className="p-4 text-right font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono text-gray-600">{p.barcode || "-"}</td>
                        <td className="p-4 font-medium text-gray-900">{p.name}</td>
                        <td className="p-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {p.category || "-"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700">
                          ${p.purchasePrice || 0} / ${p.salePrice || 0}
                        </td>
                        <td className="p-4 text-gray-900 font-semibold">{p.stock}</td>
                        <td className="p-4">
                          <div
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold flex items-center w-fit ${
                              p.status === "In Stock"
                                ? "border border-green-300 bg-green-50 text-green-700"
                                : p.status === "Low Stock"
                                ? "border border-yellow-300 bg-yellow-50 text-yellow-700"
                                : "border border-red-300 bg-red-50 text-red-700"
                            }`}
                          >
                            {p.status !== "In Stock" && p.status !== "Low Stock" && (
                              <TriangleAlert className="h-3.5 w-3.5 mr-1" />
                            )}
                            {p.status}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setEditQuantity(p.stock);
                            }}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <SquarePen className="h-4 w-4" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Update Stock</h2>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold text-gray-900">
                  {products.find((p) => p.id === editingId)?.name}
                </span>
              </p>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Quantity
              </label>
              <input
                type="number"
                min="0"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg font-semibold"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await window.api.updateStock({
                    id: editingId,
                    quantity: Number(editQuantity),
                  });
                  setEditingId(null);
                  load();
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;