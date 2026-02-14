import { useEffect, useState } from "react";
import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import RootLayout from "./layout/RootLayout";
import Product from "./layout/Product";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";

import "./App.css";
import Checkout from "./pages/Checkout";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";

import Setup from "./pages/Setup";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(null); // null = unknown, true = exists, false = setup needed
  const [carts, setCarts] = useState([[]]);
  const [activeCartIndex, setActiveCartIndex] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const checkSystemAndUser = async () => {
      try {
        // 1. Check system status (does admin exist?)
        const status = await window.api.checkSystemStatus();
        setHasAdmin(status.hasAdmin);

        // 2. Check current session
        const currentUser = await window.api.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkSystemAndUser();
  }, []);

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      {(() => {
        if (loading) {
          return (
            <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          );
        }

        if (hasAdmin === false) {
          return <Setup onSetupComplete={(newUser) => {
            setHasAdmin(true);
            setUser(newUser);
          }} />;
        }

        if (!user) {
          return <Login onLogin={setUser} />;
        }

        const router = createHashRouter(
          createRoutesFromElements(
            <Route element={<RootLayout />}>
              <Route path="/admin" element={<AdminPanel user={user} onLogout={() => setUser(null)} />} />
              <Route path="/" element={<Product user={user} onLogout={() => setUser(null)} cartState={{ carts, setCarts, activeCartIndex, setActiveCartIndex, discount, setDiscount }} />}>
                <Route index element={<Checkout />} />
                <Route path="manage-inventory" element={<Inventory />} />
                <Route path="dashboard" element={<Dashboard user={user} />} />
              </Route>
            </Route>
          )
        );

        return <RouterProvider router={router} />;
      })()}
    </>
  );
}
