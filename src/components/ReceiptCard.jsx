import { Printer } from "lucide-react";

const ReceiptCard = ({ cart, lastOrder }) => {
  const total = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);
  const displayOrder = lastOrder || { items: cart, total: total.toFixed(2), date: new Date().toLocaleString() };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <Printer className="mr-2 h-5 w-5 text-blue-600" /> Receipt
        </h3>
      </div>
      <div className="p-6 pt-0 bg-gray-50 text-black font-mono text-xs min-h-[400px] max-h-[400px] overflow-auto border border-gray-200 rounded">
        <div className="text-center pb-4">
          <div className="font-bold text-sm">PHARMACY POS</div>
          <div className="text-xs mt-2">Receipt</div>
          <div className="text-xs border-b border-gray-400 py-2 mb-4">
            {displayOrder.date || new Date().toLocaleString()}
          </div>
        </div>

        <div className="space-y-1 pb-4">
          <div className="flex justify-between text-xs font-bold pb-2 border-b border-gray-400">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
          </div>
          {displayOrder.items && displayOrder.items.length > 0 ? (
            displayOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="flex-1">{item.name}</span>
                <span className="w-8 text-right">{item.quantity}</span>
                <span className="w-12 text-right">${parseFloat(item.salePrice).toFixed(2)}</span>
                <span className="w-12 text-right">${(parseFloat(item.salePrice) * item.quantity).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">No items</div>
          )}
        </div>

        <div className="border-t-2 border-gray-400 pt-2">
          <div className="flex justify-between font-bold text-sm pb-4">
            <span>TOTAL:</span>
            <span>${displayOrder.total || "0.00"}</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
          Thank you for your purchase!
        </div>
      </div>
      <div className="flex items-center p-6 pt-0">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full rounded-md flex items-center gap-2 justify-center font-semibold"
        >
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptCard;