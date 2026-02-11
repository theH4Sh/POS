import { SquarePen, TriangleAlert, Trash2 } from "lucide-react";

export default function InventoryTable({ products, onEditProduct, onDeleteProduct, canEdit = false }) {
  return (
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
          {products.length > 0 ? (
            products.map((p) => (
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
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold flex items-center w-fit ${p.status === "In Stock"
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
                  {canEdit && (
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onEditProduct(p)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit Product"
                      >
                        <SquarePen className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
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
  );
}
