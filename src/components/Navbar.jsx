import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, ListFilter, TrendingUp, LogOut, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import ProfileModal from "./ProfileModal";

export const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = async () => {
    await window.api.logout();
    onLogout();
  };

  const handleAdminPanel = () => {
    navigate("/admin");
  };

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

          <div className="flex items-center gap-4">
            {/* Main Navigation */}
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
                  `${baseLink} ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white"
                  }`
                }
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                <span>Checkout</span>
              </NavLink>

              <NavLink
                to="/manage-inventory"
                role="tab"
                className={({ isActive }) =>
                  `${baseLink} ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white"
                  }`
                }
              >
                <ListFilter className="h-4.5 w-4.5" />
                <span>Manage Inventory</span>
              </NavLink>

              {user?.role === "admin" && (
                <NavLink
                  to="/dashboard"
                  role="tab"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-blue-600 hover:bg-white"
                    }`
                  }
                >
                  <TrendingUp className="h-4.5 w-4.5" />
                  <span>Analytics</span>
                </NavLink>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <div className="h-6 w-6 bg-white/30 rounded flex items-center justify-center text-sm font-bold">
                  {user?.username?.[0].toUpperCase()}
                </div>
                <span className="text-sm">{user?.username}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Logged in as</p>
                    <p className="font-bold text-gray-900">{user?.username}</p>
                    <p className="text-xs text-blue-600 uppercase font-semibold mt-1">
                      {user?.role}
                    </p>
                  </div>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        handleAdminPanel();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium flex items-center gap-2 transition-all"
                    >
                      <Lock className="h-4 w-4 text-blue-600" />
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium flex items-center gap-2 transition-all"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 transition-all border-t border-gray-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateSuccess={() => {
          // Optional: trigger a re-fetch of user data if needed,
          // although the modal handles the update.
          // We could force a logout here if the password changed, or just let them stay logged in.
          // For now, let's keep them logged in but maybe refresh user state?
          // Since app state is lifted, we might need a way to refresh 'user' in App.jsx.
          // But valid session is enough.
          window.location.reload(); // Simple way to refresh app state
        }}
      />
    </nav>
  );
};
