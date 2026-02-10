import { ShoppingCart, Trash2 } from "lucide-react";

const CartItemsCard = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }) => {
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.salePrice) * item.quantity), 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" /> Cart Items
        </h3>
      </div>

      <div className="p-6 pt-0 overflow-auto max-h-96">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Cart is empty. Scan or search for products to add.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="p-4 text-left font-medium text-gray-500">Product</th>
                <th className="p-4 text-right font-medium text-gray-500">Price</th>
                <th className="p-4 text-center font-medium text-gray-500">Quantity</th>
                <th className="p-4 text-right font-medium text-gray-500">Total</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    <div>
                      {item.name}
                      <div className="text-xs text-gray-400">{item.barcode || "No barcode"}</div>
                    </div>
                  </td>
                  <td className="p-4 text-right">${parseFloat(item.salePrice).toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="border border-gray-300 bg-white h-8 w-8 rounded-r-none hover:bg-gray-100"
                      >
                        -
                      </button>
                      <div className="h-8 px-3 flex items-center justify-center border-y border-gray-300 min-w-12">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="border border-gray-300 bg-white h-8 w-8 rounded-l-none hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right">${(parseFloat(item.salePrice) * item.quantity).toFixed(2)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="h-10 w-10 hover:bg-red-50 rounded-md text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between p-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClearCart}
          disabled={cart.length === 0}
          className="border border-gray-300 bg-white h-10 px-4 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" /> Clear Cart
        </button>
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">
            Total: ${total.toFixed(2)}
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="bg-green-600 text-white hover:bg-green-700 h-10 px-6 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemsCard;