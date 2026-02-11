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
        {/* Cart Tabs */}
        <div className="flex gap-3 items-center bg-gradient-to-r from-white to-blue-50 p-4 rounded-xl shadow-md border border-gray-200">
          <div className="flex gap-2 flex-1 overflow-x-auto pb-2">
            {carts.map((cartItems, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition relative group ${
                  activeCartIndex === index
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <button
                  onClick={() => switchCart(index)}
                  className="flex-1 text-left"
                >
                  Customer {index + 1}
                </button>
                {cartItems.length > 0 && (
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    activeCartIndex === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {cartItems.length}
                  </span>
                )}
                {carts.length > 1 && (
                  <button
                    onClick={() => deleteCart(index)}
                    className={`ml-1 p-1 rounded transition ${
                      activeCartIndex === index
                        ? 'hover:bg-blue-500 text-white'
                        : 'hover:bg-red-100 text-red-600'
                    }`}
                    title="Close cart"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addNewCart}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 flex items-center gap-2 transition shadow-md whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> New
          </button>
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
            className={`p-4 rounded-lg border ${
              checkoutMessage.startsWith("✓")
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