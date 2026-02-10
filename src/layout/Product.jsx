import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

const Product = () => {
  return ( 
    <div className="w-full">
      <Navbar />
      <div className="">
        <Outlet />
      </div>
    </div>
   );
}
 
export default Product;