import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

const Product = () => {
  return ( 
    <div>
      <h1 className="text-3xl font-bold mb-6">Pharmacy POS – Inventory</h1>
      <Navbar />
      <Outlet />
    </div>
   );
}
 
export default Product;