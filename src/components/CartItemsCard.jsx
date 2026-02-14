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
  showCustomDiscount = false,
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
                          data-qty-input="true"
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
                          onKeyDown={(e) => {
                            if (e.altKey && (e.key === "=" || e.key === "+")) {
                              e.preventDefault();
                              onUpdateQuantity(item.id, Number(item.quantity || 0) + 1);
                            } else if (e.altKey && (e.key === "-" || e.key === "_")) {
                              e.preventDefault();
                              onUpdateQuantity(item.id, Number(item.quantity || 0) - 1);
                            } else if (e.key === "Enter") {
                              e.target.blur();
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
      <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-xl space-y-3 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.05)] z-20 rounded-b-3xl">

        {/* Discount Section - Compact Card */}
        <div className="bg-gray-50/50 border border-gray-100/50 rounded-xl p-3 flex items-center justify-between group/discount hover:bg-white hover:shadow-sm transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover/discount:scale-105 transition-transform">
              <span className="text-xs font-bold">%</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-700">Discount</span>
              <span className="block text-[9px] text-gray-400 font-medium uppercase tracking-wider">Alt + D</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-200/50 p-0.5 rounded-lg backdrop-blur-sm">
              {[0, 3, 5, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => onDiscountChange(val)}
                  className={`px-2 py-1 rounded-md text-[10px] font-black transition-all duration-300 ${discount === val
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {val === 0 ? 'OFF' : `${val}%`}
                </button>
              ))}
            </div>
            {showCustomDiscount && (
              <div className="relative group/input animate-slide-up">
                <input
                  type="text"
                  inputMode="numeric"
                  data-discount-input="true"
                  value={discount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") { onDiscountChange(0); return; }
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) onDiscountChange(num);
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-7 bg-white border border-gray-200 rounded-lg text-center text-[10px] font-black text-gray-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                  placeholder="%"
                />
                <span className="absolute right-1.5 top-1.5 text-[9px] font-black text-gray-300 pointer-events-none">%</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Price Row */}
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-bold text-gray-400">₨</span>
            <span className="text-base font-black text-gray-700 font-mono leading-none">{Math.round(subtotal)}</span>
          </div>
        </div>

        {/* Global Total Area */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100/50">
          <div className="relative group/total">
            <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-0.5">Total</span>
            <div className="flex items-center gap-3">
              <div className="flex items-start gap-1">
                <span className="text-base font-bold text-gray-400 mt-0.5 leading-none">₨</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none group-hover/total:text-indigo-600 transition-colors duration-500">
                  {Math.round(total)}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1 mb-0.5 animate-pulse" />
                </span>
              </div>
              {discount > 0 && (
                <div className="flex flex-col">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg shadow-sm border border-emerald-200/50 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    SAVED ₨{Math.round(discountAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClearCart}
              disabled={cart.length === 0}
              className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-all uppercase tracking-widest disabled:opacity-0 py-2 px-1"
            >
              Discard
            </button>
            <button
              onClick={onCheckout}
              disabled={cart.length === 0}
              className="group relative bg-gray-900 text-white pl-5 pr-4 py-3 rounded-xl font-black hover:bg-black hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 group-hover:w-full transition-all duration-500 opacity-0 group-hover:opacity-10" />
              <span className="relative text-[11px] tracking-wider uppercase">Confirm Payment</span>
              <div className="relative p-1 bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                <span className="block text-sm translate-x-0 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemsCard;