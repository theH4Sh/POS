import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

const Product = ({ user, onLogout, cartState }) => {
  const navigate = useNavigate();

  // Global navigation shortcuts
  useKeyboardShortcuts({
    navigateCheckout: () => navigate("/"),
    navigateInventory: () => navigate("/manage-inventory"),
    navigateAnalytics: user?.role === "admin" ? () => navigate("/dashboard") : undefined,
  });

  return (
    <div className="w-full">
      <Navbar user={user} onLogout={onLogout} />
      <div className="">
        <Outlet context={{ user, onLogout, ...cartState }} />
      </div>
    </div>
  );
}

export default Product;