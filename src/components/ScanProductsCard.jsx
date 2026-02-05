import { Barcode, Search } from "lucide-react";

const ScanProductsCard = () => {
  const testBarcodes = [
    ["Coca Cola", "123456789"],
    ["Doritos Nacho Cheese", "987654321"],
    ["Snickers Bar", "456789123"],
    ["Milk 1 Gallon", "789123456"],
    ["Bread", "321654987"],
    ["Bananas (lb)", "654987321"],
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <Barcode className="mr-2 h-5 w-5 text-gray-700" /> Scan Products
        </h3>
        <p className="text-sm text-gray-500">
          Enter product barcode to simulate scanning
        </p>
      </div>

      <div className="p-6 pt-0 space-y-4">
        <form className="flex space-x-2">
          <input
            type="text"
            placeholder="Simulate barcode scan"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md h-10 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
          >
            <Barcode className="h-4 w-4" /> Scan
          </button>
        </form>

        <form className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter barcode manually"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md h-10 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
          >
            <Search className="h-4 w-4" /> Find
          </button>
        </form>

        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-medium mb-2">Available Test Barcodes:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {testBarcodes.map(([name, code]) => (
              <div key={code} className="flex justify-between">
                <span>{name}:</span>
                <span className="font-mono">{code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanProductsCard;