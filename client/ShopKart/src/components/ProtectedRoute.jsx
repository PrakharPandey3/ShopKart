import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { axiosInstance } from "../services/api";

function ProtectedRoute() {

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {

        const checkAuthentication = async () => {
            try {

                await axiosInstance.get("/customers/me");

                setAuthenticated(true);

            } catch (error) {

                console.error("Authentication check failed:", error);

                setAuthenticated(false);

            } finally {

                setLoading(false);

            }
        };

        checkAuthentication();

    }, []);


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-lg font-semibold text-gray-500">
                    Checking authentication...
                </p>
            </div>
        );
    }


    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }


    return <Outlet />;
}

export default ProtectedRoute;