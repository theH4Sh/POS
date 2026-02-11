import ScanProductsCard from "../components/ScanProductsCard";
import CartItemsCard from "../components/CartItemsCard";
import ReceiptCard from "../components/ReceiptCard";
import LowStockAlerts from "../components/LowStockAlerts";
import { useState } from "react";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");

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
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const item = cart.find((c) => c.id === productId);
    if (!item) return;

    if (newQuantity > (item.stock ?? 0)) {
      setCheckoutMessage(`✗ Only ${item.stock} available for ${item.name}`);
      return;
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
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutMessage("Cart is empty!");
      return;
    }

    // Final validation: ensure no cart item exceeds stock
    for (const item of cart) {
      if (item.quantity > (item.stock ?? 0)) {
        setCheckoutMessage(`✗ Cannot checkout ${item.quantity} of ${item.name}. Only ${item.stock} available.`);
        return;
      }
    }

    try {
      const total = cart
        .reduce((acc, item) => acc + parseFloat(item.salePrice) * item.quantity, 0)
        .toFixed(2);

      const result = await window.api.createOrder({
        items: cart,
        total: total,
      });

      if (!result || !result.success) {
        setCheckoutMessage(`✗ ${result?.message || 'Order failed'}`);
        return;
      }

      setLastOrder({
        items: cart,
        total: total,
        date: new Date().toLocaleString(),
      });

      setCheckoutMessage("✓ Order completed successfully!");
      setCart([]);

      setTimeout(() => setCheckoutMessage(""), 3000);
    } catch (err) {
      setCheckoutMessage("✗ Error processing order: " + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Left / Main Column */}
      <div className="md:col-span-2 space-y-6">
        <ScanProductsCard onProductScanned={handleProductScanned} />
        <CartItemsCard
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <ReceiptCard cart={cart} lastOrder={lastOrder} />
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