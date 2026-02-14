import { ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

const CartItemsCard = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  discount = 0,
  onDiscountChange = () => { },
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (cart.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [cart.length]);

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.salePrice) * item.quantity,
    0
  );

  const discountAmount = Math.round(subtotal * discount / 100);
  const total = subtotal - discountAmount;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl flex flex-col h-[600px] overflow-hidden">

      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center text-gray-800 gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          Current Cart
        </h3>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {cart.length} Items
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p className="font-medium">Cart is empty</p>
            <p className="text-xs max-w-[200px] text-center opacity-60">Scan products or use the search bar to add items</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white sticky top-0 z-10 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {cart.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-blue-50/30 transition-colors duration-200"
                >
                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 mb-0.5">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.barcode || "N/A"}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${(item.stock || 0) < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                        {item.stock} left
                      </span>
                    </div>
                  </td>

                  {/* Quantity Counter */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm group-hover:border-blue-200 group-hover:shadow-md transition-all">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all"
                        >
                          −
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.quantity}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Allow empty string or just the minus sign for easier typing/refunds
                            if (val === "" || val === "-") {
                              onUpdateQuantity(item.id, val);
                              return;
                            }
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) {
                              onUpdateQuantity(item.id, num);
                            }
                          }}
                          onBlur={(e) => {
                            // Reset to 0 if blurred with invalid content
                            if (e.target.value === "" || e.target.value === "-") {
                              onUpdateQuantity(item.id, 0);
                            }
                          }}
                          className="w-10 text-center bg-transparent font-bold text-gray-800 outline-none text-sm"
                        />
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-green-600 hover:shadow-sm transition-all"
                        >
                          +
                        </button>
                      </div>


                      {item.quantity < 0 && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 rounded">Refund</span>
                      )}
                      {item.stock != null && item.quantity >= item.stock && item.quantity > 0 && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 rounded">Max</span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-right text-gray-500 font-medium font-mono">
                    {Math.round(Number(item.salePrice))}
                  </td>

                  {/* Row Total */}
                  <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono text-base">
                    {Math.round(Number(item.salePrice) * item.quantity)}
                  </td>

                  {/* Remove */}
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 bg-white space-y-5 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">

        {/* Discount Section */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">Discount</span>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {[0, 5, 10].map((val) => (
              <button
                key={val}
                onClick={() => onDiscountChange(val)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${discount === val
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {val === 0 ? 'None' : `${val}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Subtotal</span>
            <span className="font-mono">{Math.round(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-red-500 text-sm font-medium">
              <span>Discount</span>
              <span className="font-mono">-{Math.round(discountAmount)}</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="block text-xs text-gray-400 font-medium uppercase tracking-wide">Total Amount</span>
            <span className="block text-3xl font-black text-gray-900 tracking-tight mt-0.5">
              <span className="text-xl align-top opacity-50 font-medium mr-1">₨</span>
              {Math.round(total)}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClearCart}
              disabled={cart.length === 0}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Clear
            </button>
            <button
              onClick={onCheckout}
              disabled={cart.length === 0}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Checkout <span className="text-gray-400 text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemsCard;