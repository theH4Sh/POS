import { Barcode, Search } from "lucide-react";
import { useState } from "react";

const ScanProductsCard = ({ onProductScanned }) => {
  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const products = await window.api.searchProduct(barcode);

      if (products.length === 1) {
        onProductScanned(products[0]);
        setBarcode("");
      } else if (products.length > 1) {
        setResults(products);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      setError(err.message || "Error searching product");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");

    try {
      const products = await window.api.searchProduct(searchQuery);

      if (products.length > 0) {
        setResults(products);
      } else {
        setError("No products found");
        setResults([]);
      }
    } catch (err) {
      setError(err.message || "Error searching product");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    onProductScanned(product);
    setResults([]);
    setSearchQuery("");
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold flex items-center">
          <Barcode className="mr-2 h-5 w-5 text-blue-600" />
          Scan Products
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter barcode or search by name
        </p>
      </div>

      <div className="p-6 space-y-4">

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Barcode */}
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Scan barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="flex-1 h-10 border border-gray-300 rounded px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            className="h-10 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "..." : "Scan"}
          </button>
        </form>

        {/* Name Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Search product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-10 border border-gray-300 rounded px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            className="h-10 px-4 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? "..." : "Find"}
          </button>
        </form>

        {/* Results List */}
        {results.length > 0 && (
          <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="font-medium text-gray-800">
                  {product.name}
                </div>
                <div className="text-xs text-gray-500">
                  Barcode: {product.barcode} | Price: Rs {product.sale_price}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanProductsCard;