import { NavLink } from "react-router-dom";
import { ShoppingCart, Plus, ListFilter } from "lucide-react";

export const Navbar = () => {
  const base =
    "flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="grid h-10 w-full grid-cols-3 items-center justify-center rounded-md bg-gray-200 p-1 text-gray-600"
    >
      <NavLink
        to="/"
        end
        role="tab"
        className={({ isActive }) =>
          `${base} ${
            isActive
              ? "bg-white text-gray-900 shadow"
              : "hover:bg-gray-300"
          }`
        }
      >
        <ShoppingCart className="h-4 w-4" />
        Checkout
      </NavLink>

      <NavLink
        to="/add-product"
        role="tab"
        className={({ isActive }) =>
          `${base} ${
            isActive
              ? "bg-white text-gray-900 shadow"
              : "hover:bg-gray-300"
          }`
        }
      >
        <Plus className="h-4 w-4" />
        Add Product
      </NavLink>

      <NavLink
        to="/manage-inventory"
        role="tab"
        className={({ isActive }) =>
          `${base} ${
            isActive
              ? "bg-white text-gray-900 shadow"
              : "hover:bg-gray-300"
          }`
        }
      >
        <ListFilter className="h-4 w-4" />
        Manage Inventory
      </NavLink>
    </div>
  );
};