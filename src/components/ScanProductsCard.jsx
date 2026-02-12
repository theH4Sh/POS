import { Barcode, Search, AlertCircle, Loader } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";

const ScanProductsCard = ({ onProductScanned }) => {
  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const products = await window.api.searchProduct(barcode);
      const mappedProducts = products.map(p => ({
        ...p,
        stock: Number.isFinite(p.quantity) ? p.quantity : 0
      }));

      if (mappedProducts.length === 1) {
        onProductScanned(mappedProducts[0]);
        setBarcode("");
        setHoveredProduct(null);
      } else if (mappedProducts.length > 1) {
        setResults(mappedProducts);
      } else {
        toast.error("Product not found");
      }
    } catch (err) {
      toast.error(err.message || "Error searching product");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      const products = await window.api.searchProduct(searchQuery);

      if (products.length > 0) {
        const mappedProducts = products.map(p => ({
          ...p,
          stock: Number.isFinite(p.quantity) ? p.quantity : 0
        }));
        setResults(mappedProducts);
        console.log("Search results:", mappedProducts);
      } else {
        toast.error("No products found");
        setResults([]);
      }
    } catch (err) {
      toast.error(err.message || "Error searching product");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    onProductScanned(product);
    setResults([]);
    setSearchQuery("");
    setHoveredProduct(null);
  };

  // Tooltip state
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <>
      {hoveredProduct && createPortal(
        <div
          className="fixed z-[1000] bg-gray-900 text-white p-3 rounded-xl shadow-2xl text-sm pointer-events-none max-w-xs animate-in fade-in duration-150 border border-gray-700"
          style={{
            top: Math.min(mousePos.y + 15, window.innerHeight - 150),
            left: Math.min(mousePos.x + 15, window.innerWidth - 250)
          }}
        >
          <p className="font-bold border-b border-gray-700 pb-1 mb-1 text-blue-300">{hoveredProduct.name}</p>
          <p className="text-gray-200 mb-1 leading-relaxed">
            {hoveredProduct.description ? hoveredProduct.description : <span className="italic text-gray-500">No description available</span>}
          </p>
          <div className="flex justify-between items-center text-xs mt-2 text-gray-400">
            <span>{hoveredProduct.category || "Uncategorized"}</span>
            <span className="font-mono bg-gray-800 px-1 rounded">{hoveredProduct.stock || 0} in stock</span>
          </div>
        </div>,
        document.body
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col h-[600px] relative">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center text-gray-800 gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Barcode className="h-5 w-5 text-indigo-600" />
            </div>
            Product Lookup
          </h3>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">

          {/* Barcode Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Barcode className="h-3.5 w-3.5" />
              Scan Barcode
            </label>
            <form onSubmit={handleBarcodeSubmit} className="relative group">
              <input
                type="text"
                placeholder="Scan product barcode..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full h-12 pl-4 pr-24 bg-gray-50 border-2 border-transparent transition-all duration-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-mono"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !barcode.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Scan"}
              </button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs font-medium text-gray-400 uppercase tracking-widest">Or Search</span>
            </div>
          </div>

          {/* Search Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Search by Name
            </label>
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input
                type="text"
                placeholder="Type product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-4 pr-24 bg-gray-50 border-2 border-transparent transition-all duration-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Find"}
              </button>
            </form>
          </div>

          {/* Results List */}
          {results.length > 0 ? (
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">Search Results</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{results.length} found</span>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    onMouseEnter={() => setHoveredProduct(product)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                    className="group bg-white border border-gray-100 p-3 rounded-xl hover:border-indigo-500 hover:shadow-md hover:ring-2 hover:ring-indigo-500/10 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate text-sm">
                          {product.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                            {product.barcode || "No Barcode"}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${(product.stock || 0) < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                            {product.stock || 0} left
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-indigo-600 font-mono">
                          {Math.round(Number(product.salePrice))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 opacity-60">
                <Search className="h-10 w-10 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium">Ready to search</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ScanProductsCard;