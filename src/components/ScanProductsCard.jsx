import { Barcode, Search } from "lucide-react";
import { useState } from "react";

const ScanProductsCard = ({ onProductScanned }) => {
  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      console.log("Searching barcode:", barcode);
      const product = await window.api.searchProduct(barcode);
      console.log("Search result:", product);
      if (product) {
        onProductScanned(product);
        setBarcode("");
      } else {
        setError("Product not found - try adding it first");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Error: " + (err.message || "Unknown error"));
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
      console.log("Searching product:", searchQuery);
      const product = await window.api.searchProduct(searchQuery);
      console.log("Search result:", product);
      if (product) {
        onProductScanned(product);
        setSearchQuery("");
      } else {
        setError("Product not found - try adding it first");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Error: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <Barcode className="mr-2 h-5 w-5 text-blue-600" /> Scan Products
        </h3>
        <p className="text-sm text-gray-500">
          Enter product barcode or search by name
        </p>
      </div>

      <div className="p-6 pt-0 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleBarcodeSubmit} className="flex space-x-2">
          <input
            type="text"
            placeholder="Scan or enter barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md h-10 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"
            disabled={loading}
          >
            <Barcode className="h-4 w-4" /> {loading ? "..." : "Scan"}
          </button>
        </form>

        <form onSubmit={handleSearchSubmit} className="flex space-x-2">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md h-10 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"
            disabled={loading}
          >
            <Search className="h-4 w-4" /> {loading ? "..." : "Find"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScanProductsCard;