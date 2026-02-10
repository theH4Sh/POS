import { TriangleAlert, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const LowStockAlerts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadLowStockProducts = async () => {
      try {
        const lowStockProducts = await window.api.listLowStockAlerts();
        setProducts(lowStockProducts);
      } catch (err) {
        console.error("Error loading low stock alerts:", err);
      }
    };

    loadLowStockProducts();
    const interval = setInterval(loadLowStockProducts, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="font-semibold tracking-tight text-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" /> Low Stock Alerts
        </h3>
        <p className="text-sm text-gray-500">Products that need to be restocked soon</p>
      </div>
      <div className="p-6 pt-0 space-y-2 max-h-80 overflow-auto">
        {products.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            No low stock items
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
              <div>
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-gray-400">{p.barcode || "No barcode"}</div>
              </div>
              <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                p.quantity === 0
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
              }`}>
                {p.quantity === 0 ? (
                  <>
                    <TriangleAlert className="h-3 w-3 mr-1" /> Out of Stock
                  </>
                ) : (
                  <>{p.quantity} left</>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LowStockAlerts;