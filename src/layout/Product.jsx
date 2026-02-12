import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

const Product = ({ user, onLogout, cartState }) => {
  return (
    <div className="w-full">
      <Navbar user={user} onLogout={onLogout} />
      <div className="">
        <Outlet context={{ user, onLogout, ...cartState }} />
      </div>
    </div>
  );
}

export default Product;