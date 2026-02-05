import { TriangleAlert } from "lucide-react";

const LowStockAlerts = () => {
  const products = [
    { name: "Tylenol Extra Strength", code: "258369147", status: "Out of Stock", type: "destructive" },
    { name: "Toilet Paper 12pk", code: "147258369", status: "2 left", type: "neutral" },
    { name: "Bread", code: "321654987", status: "3 left", type: "neutral" },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="font-semibold tracking-tight text-lg flex items-center">
          <TriangleAlert className="h-5 w-5 mr-2 text-amber-500" /> Low Stock Alerts
        </h3>
        <p className="text-sm text-gray-500">Products that need to be restocked soon</p>
      </div>
      <div className="p-6 pt-0 space-y-2">
        {products.map((p) => (
          <div key={p.code} className="flex items-center justify-between border-b pb-2">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-400">{p.code}</div>
            </div>
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              p.type === "destructive"
                ? "bg-red-100 text-red-700 border-red-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}>
              {p.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlerts;