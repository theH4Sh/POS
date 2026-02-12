import ScanProductsCard from "../components/ScanProductsCard";
import CartItemsCard from "../components/CartItemsCard";
import ReceiptCard from "../components/ReceiptCard";
import LowStockAlerts from "../components/LowStockAlerts";
import { useState } from "react";
import { Plus, X } from "lucide-react";

const Checkout = () => {
  const [carts, setCarts] = useState([[]]);
  const [activeCartIndex, setActiveCartIndex] = useState(0);
  const [lastOrder, setLastOrder] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [discount, setDiscount] = useState(0);

  const cart = carts[activeCartIndex] || [];

  const setCart = (newCart) => {
    const newCarts = [...carts];
    newCarts[activeCartIndex] = newCart;
    setCarts(newCarts);
  };

  const addNewCart = () => {
    setCarts([...carts, []]);
    setActiveCartIndex(carts.length);
  };

  const deleteCart = (index) => {
    if (carts.length === 1) return; // Keep at least one cart
    const newCarts = carts.filter((_, i) => i !== index);
    setCarts(newCarts);
    if (activeCartIndex >= newCarts.length) {
      setActiveCartIndex(newCarts.length - 1);
    } else {
      setActiveCartIndex(activeCartIndex);
    }
  };

  const handleProductScanned = (product) => {
    // Check if product already in cart
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Prevent exceeding available stock
      if (existingItem.quantity + 1 > existingItem.stock) {
        setCheckoutMessage(`✗ Only ${existingItem.stock} available for ${existingItem.name}`);
        return;
      }

      // Update cart quantity
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // If product has no stock or stock is zero
      const available = Number.isFinite(product.quantity) ? product.quantity : 0;
      if (available <= 0) {
        setCheckoutMessage(`✗ ${product.name} is out of stock`);
        return;
      }

      // Add new item to cart and preserve available stock as `stock`
      setCart([...cart, { ...product, stock: available, quantity: 1 }]);
    }
    setCheckoutMessage("");
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const item = cart.find((c) => c.id === productId);
    if (!item) return;

    // Allow negative quantities for refunds, but don't exceed stock in positive direction
    if (newQuantity > 0 && newQuantity > (item.stock ?? 0)) {
      setCheckoutMessage(`✗ Only ${item.stock} available for ${item.name}`);
      return;
    }

    // Only remove if explicitly set to 0 and not trying to refund
    if (newQuantity === 0 && item.quantity > 0) {
      // Allow removing by trash icon, but clicking minus from 1 should go to 0, then -1, -2...
      // So we update, don't remove automatically
    }

    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    setCheckoutMessage("");
  };

  const handleRemoveItem = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCheckoutMessage("");
    setDiscount(0);
  };

  const switchCart = (index) => {
    setActiveCartIndex(index);
    setCheckoutMessage("");
    setDiscount(0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutMessage("Cart is empty!");
      return;
    }

    const total = cart
      .reduce((acc, item) => acc + parseFloat(item.salePrice) * item.quantity, 0)
      .toFixed(2);

    const discountAmount = (parseFloat(total) * discount / 100).toFixed(2);
    const finalTotal = (parseFloat(total) - parseFloat(discountAmount)).toFixed(2);

    const isRefund = parseFloat(finalTotal) < 0;

    // Only validate stock for positive transactions
    if (!isRefund) {
      for (const item of cart) {
        if (item.quantity > (item.stock ?? 0)) {
          setCheckoutMessage(`✗ Cannot checkout ${item.quantity} of ${item.name}. Only ${item.stock} available.`);
          return;
        }
      }
    }

    try {
      const result = await window.api.createOrder({
        items: cart,
        total: finalTotal,
      });

      if (!result || !result.success) {
        setCheckoutMessage(`✗ ${result?.message || 'Order failed'}`);
        return;
      }

      setLastOrder({
        items: cart,
        total: finalTotal,
        originalTotal: total,
        discount: discount,
        discountAmount: discountAmount,
        date: new Date().toLocaleString(),
        isRefund: isRefund,
      });

      setCheckoutMessage(isRefund ? "✓ Refund processed!" : "✓ Order completed successfully!");
      setCart([]);
      setDiscount(0);

      setTimeout(() => setCheckoutMessage(""), 3000);
    } catch (err) {
      setCheckoutMessage("✗ Error processing order: " + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Left / Main Column */}
      <div className="md:col-span-2 space-y-6">
        {/* Cart Tabs - Modern Segmented Control */}
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex gap-1 overflow-x-auto no-scrollbar mask-gradient">
            {carts.map((cartItems, index) => (
              <div
                key={index}
                className={`relative group flex items-center pr-2 rounded-xl transition-all duration-300 ease-out cursor-pointer select-none ${activeCartIndex === index
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200'
                    : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                onClick={() => switchCart(index)}
              >
                <div className="px-4 py-2.5 font-semibold text-sm whitespace-nowrap">
                  Customer {index + 1}
                </div>

                {cartItems.length > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1 transition-colors ${activeCartIndex === index
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                    }`}>
                    {cartItems.length}
                  </span>
                )}

                {carts.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCart(index);
                    }}
                    className={`p-1.5 rounded-full mr-1 transition-all opacity-60 hover:opacity-100 ${activeCartIndex === index
                        ? 'hover:bg-blue-500 text-white'
                        : 'hover:bg-red-100 text-gray-400 hover:text-red-600'
                      }`}
                    title="Close cart"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pl-4 border-l border-gray-100 ml-2">
            <button
              onClick={addNewCart}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 hover:scale-105 active:scale-95 transition-all shadow-sm border border-blue-100"
              title="New Customer"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ScanProductsCard onProductScanned={handleProductScanned} />
        <CartItemsCard
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          discount={discount}
          onDiscountChange={setDiscount}
        />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <ReceiptCard cart={cart} lastOrder={lastOrder} discount={discount} />
        {checkoutMessage && (
          <div
            className={`p-4 rounded-lg border ${checkoutMessage.startsWith("✓")
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
              }`}
          >
            {checkoutMessage}
          </div>
        )}
        <LowStockAlerts />
      </div>
    </div>
  );
};

export default Checkout;