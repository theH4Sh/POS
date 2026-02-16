import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGuard() {
    const { user, hasAdmin, loading } = useAuth();
    const location = useLocation();

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

    // Handle system setup redirect
    if (hasAdmin === false && location.pathname !== "/setup") {
        return <Navigate to="/setup" replace />;
    }

    // Handle login redirect
    if (!user && location.pathname !== "/login" && location.pathname !== "/setup") {
        return <Navigate to="/login" replace />;
    }

    // Prevent accessing login/setup if already authorized
    if (user && (location.pathname === "/login" || location.pathname === "/setup")) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
