import { ShoppingCart, Trash2 } from "lucide-react";

const CartItemsCard = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  discount = 0,
  onDiscountChange = () => {},
}) => {
  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.salePrice) * item.quantity,
    0
  );
  
  const discountAmount = (subtotal * discount / 100);
  const total = subtotal - discountAmount;

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
                            onUpdateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        >
                          −
                        </button>

                        {/* Quantity */}
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val)) return;
                            onUpdateQuantity(item.id, val);
                          }}
                          className="w-14 h-9 text-center border-x border-gray-200 outline-none focus:bg-blue-50"
                        />

                        {/* Plus */}
                        <button
                          onClick={() => {
                            onUpdateQuantity(
                              item.id,
                              item.quantity + 1
                            );
                          }}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity < 0 && (
                          <span className="text-xs text-red-500">
                            Refund: {Math.abs(item.quantity)}
                          </span>
                        )}
                      {item.stock != null &&
                        item.quantity > 0 &&
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
      <div className="p-6 border-t border-gray-200 space-y-4 bg-gray-50">
        
        {/* Discount Buttons */}
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Discount:</span>
          <button
            onClick={() => onDiscountChange(0)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              discount === 0
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            None
          </button>
          <button
            onClick={() => onDiscountChange(5)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              discount === 5
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            5%
          </button>
          <button
            onClick={() => onDiscountChange(10)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              discount === 10
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            10%
          </button>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span>₨ {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-red-600 font-medium">
              <span>Discount ({discount}%):</span>
              <span>-₨ {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
            <span>Total:</span>
            <span>₨ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClearCart}
            disabled={cart.length === 0}
            className="border border-gray-300 bg-white px-4 h-10 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Cart
          </button>

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