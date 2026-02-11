import { ShoppingCart, Trash2 } from "lucide-react";

const CartItemsCard = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const total = cart.reduce(
    (acc, item) => acc + Number(item.salePrice) * item.quantity,
    0
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-md flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold flex items-center text-gray-800">
          <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
          Cart
        </h3>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto max-h-[420px]">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Cart is empty
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 text-left font-medium">Product</th>
                <th className="p-4 text-right font-medium">Price</th>
                <th className="p-4 text-center font-medium">Qty</th>
                <th className="p-4 text-right font-medium">Total</th>
                <th className="p-4"></th>
              </tr>
            </thead>

            <tbody>
              {cart.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* Product */}
                  <td className="p-4">
                    <div className="font-medium text-gray-800">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.barcode || "No barcode"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Available:{" "}
                      <span className="font-medium">
                        {item.stock ?? "—"}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-4 text-right text-gray-700">
                    ₨ {Number(item.salePrice).toFixed(2)}
                  </td>

                  {/* Quantity Counter */}
                  <td className="p-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                        
                        {/* Minus */}
                        <button
                          onClick={() => {
                            const newQty = Math.max(1, item.quantity - 1);
                            onUpdateQuantity(item.id, newQty);
                          }}
                          disabled={item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          −
                        </button>

                        {/* Quantity */}
                        <input
                          type="number"
                          min={1}
                          max={item.stock ?? undefined}
                          value={item.quantity}
                          onChange={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val)) return;

                            const min = 1;
                            const max = item.stock ?? Infinity;

                            val = Math.max(min, Math.min(max, val));
                            onUpdateQuantity(item.id, val);
                          }}
                          className="w-14 h-9 text-center border-x border-gray-200 outline-none focus:bg-blue-50"
                        />

                        {/* Plus */}
                        <button
                          onClick={() => {
                            if (
                              item.stock != null &&
                              item.quantity >= item.stock
                            )
                              return;

                            onUpdateQuantity(
                              item.id,
                              item.quantity + 1
                            );
                          }}
                          disabled={
                            item.stock != null &&
                            item.quantity >= item.stock
                          }
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Stock Warning */}
                      {item.stock != null &&
                        item.quantity >= item.stock && (
                          <span className="text-xs text-red-500">
                            Max available reached
                          </span>
                        )}
                    </div>
                  </td>

                  {/* Row Total */}
                  <td className="p-4 text-right font-medium text-gray-800">
                    ₨{" "}
                    {(Number(item.salePrice) * item.quantity).toFixed(2)}
                  </td>

                  {/* Remove */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="h-9 w-9 flex items-center justify-center rounded-md text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        
        <button
          onClick={onClearCart}
          disabled={cart.length === 0}
          className="border border-gray-300 bg-white px-4 h-10 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Cart
        </button>

        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold text-gray-900">
            ₨ {total.toFixed(2)}
          </div>

          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="bg-green-600 text-white px-6 h-10 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemsCard;