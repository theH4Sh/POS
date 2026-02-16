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
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";

const router = createHashRouter(
  createRoutesFromElements(
    <Route element={<AuthGuard />}>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route element={<RootLayout />}>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/" element={<Product />}>
          <Route index element={<Checkout />} />
          <Route path="manage-inventory" element={<Inventory />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Route>
    </Route>
  )
);

export default function App() {
  return (
    <CartProvider>
      <Toaster position="bottom-right" reverseOrder={false} />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </CartProvider>
  );
}
