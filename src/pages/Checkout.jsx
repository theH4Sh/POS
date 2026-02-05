import ScanProductsCard from "../components/ScanProductsCard";
import CartItemsCard from "../components/CartItemsCard";
import ReceiptCard from "../components/ReceiptCard";
import LowStockAlerts from "../components/LowStockAlerts";

const Checkout = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Left / Main Column */}
      <div className="md:col-span-2 space-y-6">
        <ScanProductsCard />
        <CartItemsCard />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <ReceiptCard />
        <LowStockAlerts />
      </div>
    </div>
  );
};

export default Checkout;