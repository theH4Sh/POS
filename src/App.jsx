import { useEffect, useState } from "react";
import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import RootLayout from "./layout/RootLayout";
import Product from "./layout/Product";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";

import "./App.css";
import Checkout from "./pages/Checkout";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carts, setCarts] = useState([[]]);
  const [activeCartIndex, setActiveCartIndex] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await window.api.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkUser();
  }, []);

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

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}
