import { ListFilter, Search, SquarePen, TriangleAlert } from "lucide-react";

const Inventory = () => {
  const products = [
    { barcode: "123456789", name: "Coca Cola", category: "Beverages", price: 1.99, stock: 15, status: "In Stock" },
    { barcode: "987654321", name: "Doritos Nacho Cheese", category: "Snacks", price: 3.49, stock: 8, status: "In Stock" },
    { barcode: "456789123", name: "Snickers Bar", category: "Candy", price: 1.29, stock: 20, status: "In Stock" },
  ];

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <ListFilter className="mr-2 h-5 w-5 text-gray-700" /> Inventory Management
        </h3>
        <p className="text-sm text-gray-500">
          View and manage your product inventory
        </p>
      </div>

      {/* Search */}
      <div className="p-6 pt-0 space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="flex h-10 w-[300px] rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-md overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-medium text-gray-500">Barcode</th>
                <th className="p-4 text-left font-medium text-gray-500">Product</th>
                <th className="p-4 text-left font-medium text-gray-500">Category</th>
                <th className="p-4 text-left font-medium text-gray-500">Price</th>
                <th className="p-4 text-left font-medium text-gray-500">Stock</th>
                <th className="p-4 text-left font-medium text-gray-500">Status</th>
                <th className="p-4 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.barcode} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-mono text-gray-700">{p.barcode}</td>
                  <td className="p-4 font-medium text-gray-900">{p.name}</td>
                  <td className="p-4 text-gray-700">{p.category}</td>
                  <td className="p-4 text-gray-700">${p.price.toFixed(2)}</td>
                  <td className="p-4 text-gray-700">{p.stock}</td>
                  <td className="p-4">
                    <div className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center w-fit
                      ${p.status === "In Stock" ? "border border-green-300 bg-green-50 text-green-700" : 
                        "border border-red-300 bg-red-50 text-red-700"}`}>
                      {p.status === "In Stock" ? p.status : <><TriangleAlert className="h-3 w-3 mr-1" /> {p.status}</>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="inline-flex items-center gap-2 text-sm font-medium h-9 rounded-md px-3 hover:bg-gray-100 hover:text-gray-900">
                      <SquarePen className="h-4 w-4 mr-1" /> Edit Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;