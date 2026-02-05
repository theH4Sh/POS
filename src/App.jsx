import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import RootLayout from "./layout/RootLayout";
import Product from "./layout/Product";

import "./App.css";
import AddProduct from "./pages/AddProduct";
import Checkout from "./pages/Checkout";
import Inventory from "./pages/Inventory";

export default function App() {
  const router = createHashRouter(
    createRoutesFromElements(
      <Route path="/" element={<Product />}>
        <Route index element={<Checkout />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="manage-inventory" element={<Inventory />} />
      </Route>
    )
  );

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}
