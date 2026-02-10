import { NavLink } from "react-router-dom";
import { ShoppingCart, Plus, ListFilter } from "lucide-react";

export const Navbar = () => {
  const baseLink =
    "flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  return (
    <nav className="w-full bg-white shadow-lg border-b-2 border-blue-600 flex-shrink-0">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Pharmacy POS
            </h1>
          </div>

          <div
            role="tablist"
            aria-orientation="horizontal"
            className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-1.5 shadow-sm border border-blue-100"
          >
            <NavLink
              to="/"
              end
              role="tab"
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white"
                }`
              }
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              <span>Checkout</span>
            </NavLink>

            <NavLink
              to="/add-product"
              role="tab"
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white"
                }`
              }
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Product</span>
            </NavLink>

            <NavLink
              to="/manage-inventory"
              role="tab"
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white"
                }`
              }
            >
              <ListFilter className="h-4.5 w-4.5" />
              <span>Manage Inventory</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};