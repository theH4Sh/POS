import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Product = () => {
  const navigate = useNavigate();
  const cartState = useCart();
  const { user, logout } = useAuth();

  // Global navigation shortcuts
  useKeyboardShortcuts({
    navigateCheckout: () => navigate("/"),
    navigateInventory: () => navigate("/manage-inventory"),
    navigateAnalytics: user?.role === "admin" ? () => navigate("/dashboard") : undefined,
  });

  return (
    <div className="w-full">
      <Navbar />
      <div className="">
        <Outlet context={{ user, logout, ...cartState }} />
      </div>
    </div>
  );
}

export default Product;