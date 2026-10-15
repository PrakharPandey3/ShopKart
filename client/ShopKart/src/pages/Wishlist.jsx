import React, { useEffect, useState } from "react";
import { axiosInstance } from "../services/api";
import { useNavigate } from "react-router-dom";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {

    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);


    // ========================================
    // GET WISHLIST
    // ========================================

    const fetchWishlist = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/wishlist");

            setWishlist(response.data.wishlist);

        } catch (error) {

            console.error(error);

            setError(
                "We couldn't load your wishlist."
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================
    // REMOVE FROM WISHLIST
    // ========================================

    const handleRemove = async (productId) => {

        try {

            setRemovingId(productId);

            await axiosInstance.delete(
                `/wishlist/${productId}`
            );

            // Remove from UI immediately
            setWishlist((currentWishlist) =>
                currentWishlist.filter(
                    (product) => product._id !== productId
                )
            );

        } catch (error) {

            console.error(error);

            setError(
                "Unable to remove product from wishlist."
            );

        } finally {

            setRemovingId(null);

        }
    };


    // ========================================
    // LOAD WISHLIST
    // ========================================

    useEffect(() => {
        fetchWishlist();
    }, []);


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">

                <p className="text-lg font-semibold text-gray-500">
                    Loading your wishlist...
                </p>

            </div>
        );
    }


    return (

        <div className="min-h-screen bg-gray-50">

            {/* Header */}

            <div className="border-b border-gray-200 bg-white">

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        ShopKart
                    </p>

                    <h1 className="mt-2 text-4xl font-black text-gray-900">
                        My Wishlist ❤️
                    </h1>

                    <p className="mt-3 text-gray-500">
                        {wishlist.length}{" "}
                        {wishlist.length === 1
                            ? "product"
                            : "products"}{" "}
                        saved
                    </p>

                </div>

            </div>


            {/* Content */}

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">


                {/* ERROR */}

                {error && (

                    <div className="mb-8 rounded-2xl bg-red-50 p-6 text-center">

                        <p className="font-semibold text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={fetchWishlist}
                            className="mt-4 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* EMPTY */}

                {!error && wishlist.length === 0 && (

                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

                        <div className="text-6xl">
                            ❤️
                        </div>

                        <h2 className="mt-5 text-2xl font-bold text-gray-900">
                            Your wishlist is empty
                        </h2>

                        <p className="mt-3 text-gray-500">
                            Save products you love and find them here later.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                            className="mt-6 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
                        >
                            Browse Products
                        </button>

                    </div>

                )}


                {/* PRODUCTS */}

                {!error && wishlist.length > 0 && (

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {wishlist.map((product) => (

                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemove}
                                removing={removingId === product._id}
                            />

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Wishlist;