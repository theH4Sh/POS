import { Printer } from "lucide-react";
import "../App.css"

const ReceiptCard = ({ cart, lastOrder, discount = 0 }) => {
  const subtotal = cart.reduce(
    (acc, item) => acc + parseFloat(item.salePrice) * item.quantity,
    0
  );
  
  const discountAmount = (subtotal * discount / 100);
  const total = subtotal - discountAmount;

  const displayOrder = lastOrder || {
    items: cart,
    total: total.toFixed(2),
    originalTotal: subtotal.toFixed(2),
    discount: discount,
    discountAmount: discountAmount.toFixed(2),
    date: new Date().toLocaleString(),
    isRefund: total < 0,
  };

  const handlePrint = () => {
  window.print();
};

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h3 className="text-2xl font-semibold flex items-center">
          <Printer className="mr-2 h-5 w-5 text-blue-600" /> Receipt
        </h3>
      </div>

      {/* RECEIPT CONTENT */}
      <div className="p-6 pt-4">
        <div
          id="print-area"
          className="bg-white text-black font-mono text-xs max-h-[450px] overflow-auto"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-base font-bold">PHARMACY POS</div>
            {displayOrder.isRefund && <div className="text-sm font-bold text-red-600">*** REFUND ***</div>}
            <div>{displayOrder.date}</div>
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          {/* Column Header */}
          <div className="flex font-bold text-xs mb-2">
            <div className="flex-1">Item</div>
            <div className="w-8 text-center">QTY</div>
            <div className="w-14 text-right">Price</div>
            <div className="w-14 text-right">Total</div>
          </div>

          <div className="border-t border-dashed border-black mb-2"></div>

          {/* Items */}
          {displayOrder.items && displayOrder.items.length > 0 ? (
            displayOrder.items.map((item, idx) => (
              <div key={idx} className="flex mb-1">
                <div className="flex-1 break-words">{item.name}</div>
                <div className="w-8 text-center">{item.quantity}</div>
                <div className="w-14 text-right">
                  {parseFloat(item.salePrice).toFixed(2)}
                </div>
                <div className="w-14 text-right">
                  {(parseFloat(item.salePrice) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-6">No items</div>
          )}

          <div className="border-t border-dashed border-black my-3"></div>

          {/* Subtotal & Discount */}
          {displayOrder.discount > 0 && (
            <>
              <div className="flex justify-between font-bold text-sm mb-1">
                <span>SUBTOTAL</span>
                <span>{displayOrder.originalTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600 mb-2">
                <span>DISCOUNT ({displayOrder.discount}%)</span>
                <span>-{displayOrder.discountAmount}</span>
              </div>
            </>
          )}

          {/* Total */}
          <div className={`receipt-item flex justify-between font-bold text-sm ${displayOrder.isRefund ? 'text-red-600' : ''}`}>
            <span>{displayOrder.isRefund ? 'REFUND' : 'TOTAL'}</span>
            <span>{displayOrder.total}</span>
          </div>

          <div className="text-center mt-6 text-xs">
            Thank you for your purchase!
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="p-6 pt-0">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white hover:bg-blue-700 h-11 px-4 py-2 w-full rounded-lg flex items-center gap-2 justify-center font-semibold transition-colors"
        >
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptCard;