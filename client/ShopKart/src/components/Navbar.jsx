import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {

    const { totalItems } = useCart();

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {

            const response = await axiosInstance.post(
                "/customers/logout"
            );

            if (response.data.success) {
                navigate("/login");

            }

        } catch (error) {

            console.error("Logout failed:", error);

        }
    };


    return (
        <nav className="border-b border-gray-200 bg-white">

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                {/* Logo */}

                <Link
                    to="/"
                    className="text-2xl font-black text-indigo-600"
                >
                    ShopKart
                </Link>


                {/* Navigation */}

                <div className="flex items-center gap-6">

                    <Link
                        to="/home"
                        className="font-medium text-gray-700 transition hover:text-indigo-600"
                    >
                        Home
                    </Link>


                    <Link
                        to="/products"
                        className="font-medium text-gray-700 transition hover:text-indigo-600"
                    >
                        Products
                    </Link>


                    <Link
                        to="/wishlist"
                        className="font-medium text-gray-700 transition hover:text-indigo-600"
                    >
                        Wishlist ❤️
                    </Link>

                    <Link
                        to="/cart"
                        className="font-medium text-gray-700 transition hover:text-indigo-600"
                    >
                        Cart ({totalItems})

                    </Link>

                    <Link
                        to="/orders"
                        className="font-medium text-gray-700 hover:text-indigo-600"
                    >
                        My Orders
                    </Link>


                    <button
                        onClick={handleLogout}
                        className="rounded-xl bg-gray-900 px-4 py-2 font-semibold text-white transition hover:bg-gray-800"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;