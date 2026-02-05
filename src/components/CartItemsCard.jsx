import { ShoppingCart } from "lucide-react";

const CartItemsCard = () => {
  const cartItems = [
    { name: "Coca Cola", code: "123456789", price: 1.99, quantity: 1 },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5 text-gray-700" /> Cart Items
        </h3>
      </div>

      <div className="p-6 pt-0 overflow-auto">
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
            {cartItems.map((item) => (
              <tr key={item.code} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4 font-medium">
                  <div>
                    {item.name}
                    <div className="text-xs text-gray-400">{item.code}</div>
                  </div>
                </td>
                <td className="p-4 text-right">${item.price.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center">
                    <button className="border border-gray-300 bg-white h-8 w-8 rounded-r-none hover:bg-gray-100">-</button>
                    <div className="h-8 px-3 flex items-center justify-center border-y border-gray-300">{item.quantity}</div>
                    <button className="border border-gray-300 bg-white h-8 w-8 rounded-l-none hover:bg-gray-100">+</button>
                  </div>
                </td>
                <td className="p-4 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                <td className="p-4">
                  <button className="h-10 w-10 hover:bg-gray-100 rounded-md">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-6 pt-0">
        <button className="border border-gray-300 bg-white h-10 px-4 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2">
          🗑 Clear Cart
        </button>
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">
            Total: ${cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)}
          </div>
          <button className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 rounded-md">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemsCard;