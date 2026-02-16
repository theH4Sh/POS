import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [hasAdmin, setHasAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkStatus = async () => {
        try {
            const status = await window.api.checkSystemStatus();
            setHasAdmin(status.hasAdmin);
            const currentUser = await window.api.getCurrentUser();
            setUser(currentUser);
        } catch (err) {
            console.error("Auth initialization error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        await window.api.logout();
        setUser(null);
    };

    const completeSetup = (userData) => {
        setHasAdmin(true);
        setUser(userData);
    };

    const value = {
        user,
        hasAdmin,
        loading,
        login,
        logout,
        completeSetup,
        checkStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
