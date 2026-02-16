import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, ListFilter, TrendingUp, LogOut, Lock, User } from "lucide-react";
import { useState } from "react";
import ProfileModal from "./ProfileModal";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleAdminPanel = () => {
    navigate("/admin");
  };



  return (
    <>
      <nav className="sticky top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-[100] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-11 w-11 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent leading-none tracking-tight">
                PHARMACY <span className="text-blue-600">POS</span>
              </h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Streamlined Efficiency</span>
            </div>
          </div>

          {/* Navigation & User Actions */}
          <div className="flex items-center gap-8">
            {/* Main Navigation */}
            <div className="flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 backdrop-blur-sm shadow-inner">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${isActive
                    ? "bg-white text-blue-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] translate-y-[-1px]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`
                }
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Checkout</span>
              </NavLink>

              <NavLink
                to="/manage-inventory"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${isActive
                    ? "bg-white text-blue-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] translate-y-[-1px]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`
                }
              >
                <ListFilter className="h-4 w-4" />
                <span>Inventory</span>
              </NavLink>

              {user?.role === "admin" && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${isActive
                      ? "bg-white text-blue-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] translate-y-[-1px]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                    }`
                  }
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Analytics</span>
                </NavLink>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1 padding-right-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all duration-300 pr-5 group"
              >
                <div className="h-10 w-10 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50 shadow-inner group-hover:bg-blue-600 transition-colors duration-300 group-hover:text-white">
                  <span className="font-black text-blue-700 group-hover:text-white">{user?.username?.[0].toUpperCase()}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-black text-gray-900 leading-none">{user?.username}</span>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter mt-0.5">{user?.role}</span>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                        {user?.username?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-black text-gray-900 leading-none">{user?.username}</p>
                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1">{user?.role} ACCOUNT</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {user?.role === "admin" && (
                      <button
                        onClick={() => {
                          handleAdminPanel();
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3.5 hover:bg-blue-50 text-gray-700 font-bold rounded-2xl flex items-center gap-3 transition-all group"
                      >
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Lock className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Admin Settings</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3.5 hover:bg-blue-50 text-gray-700 font-bold rounded-2xl flex items-center gap-3 transition-all group"
                    >
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm">My Profile</span>
                    </button>

                    <div className="h-px bg-gray-100 my-2 mx-4"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3.5 hover:bg-red-50 text-red-600 font-bold rounded-2xl flex items-center gap-3 transition-all group"
                    >
                      <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="text-sm">Sign Out System</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Dropdown Backdrop - Outside navbar for full screen coverage */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateSuccess={() => {
          window.location.reload();
        }}
      />
    </>
  );
};
