import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [carts, setCarts] = useState([[]]);
    const [activeCartIndex, setActiveCartIndex] = useState(0);
    const [discount, setDiscount] = useState(0);

    const value = {
        carts,
        setCarts,
        activeCartIndex,
        setActiveCartIndex,
        discount,
        setDiscount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
