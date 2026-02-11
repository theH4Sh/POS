import { Barcode, Search, AlertCircle, Loader } from "lucide-react";
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
        console.log("Search results:", products);
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
    <div className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-blue-800">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Barcode className="mr-3 h-6 w-6" />
          Scan Products
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          Quickly find products by barcode or name
        </p>
      </div>

      <div className="p-6 space-y-5">

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Barcode */}
        <form onSubmit={handleBarcodeSubmit} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Barcode className="inline h-4 w-4 mr-1" />
            Barcode
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Scan or enter barcode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1 h-11 border border-gray-300 rounded-lg px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="h-11 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {!loading && "Scan"}
            </button>
          </div>
        </form>

        {/* Name Search */}
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Search className="inline h-4 w-4 mr-1" />
            Search by Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-11 border border-gray-300 rounded-lg px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
            <button
              type="submit"
              className="h-11 px-6 bg-gray-700 text-white rounded-lg hover:bg-gray-800 active:bg-gray-900 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {!loading && "Find"}
            </button>
          </div>
        </form>

        {/* Results List */}
        {results.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-600 mb-3">
              Found {results.length} product{results.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all active:scale-98 group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <div>Barcode: <span className="font-mono text-gray-700">{product.barcode}</span></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-blue-600">
                        Rs {product.salePrice}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Sale price</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && !error && (
          <div className="text-center py-8 text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No products selected yet</p>
            <p className="text-xs mt-1">Start by scanning a barcode or searching by name</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanProductsCard;