import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {

    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [wishlistAdded, setWishlistAdded] = useState(false);
    const [error, setError] = useState("");

    const handleWishlist = async () => {

        if (saving) return;

        try {

            setSaving(true);
            setError("");

            const response = await axiosInstance.post(
                `/wishlist/${product._id}`
            );

            if (response.data.success) {
                setWishlistAdded(true);
            }

        } catch (error) {

            console.error(error);

            if (error.response?.status === 409) {
                setWishlistAdded(true);
            } else {
                setError("Unable to save product.");
            }

        } finally {

            setSaving(false);

        }
    };

    const { addToCart } = useCart();

    const [adding, setAdding] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    const handleAddToCart = async () => {
        if (adding) return;

        setAdding(true);
        setCartMessage("");
        setCartError("");

        try {
            await addToCart(product._id);
            setCartMessage("Added to cart!");
        } catch (error) {
            setCartError(
                error.response?.data?.message ||
                "Unable to add product."
            );
        } finally {
            setAdding(false);
        }
    };


    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            {/* Image */}

            <div className="relative">

                <img
                    src={product.image}
                    alt={product.name}
                    className="h-56 w-full object-cover"
                />

                {/* Wishlist heart */}

                <button
                    onClick={handleWishlist}
                    disabled={saving || wishlistAdded}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-md transition hover:scale-110 disabled:cursor-not-allowed"
                >
                    {wishlistAdded ? "♥" : "♡"}
                </button>

            </div>


            {/* Product information */}

            <div className="p-5">

                <p className="text-sm font-medium text-indigo-600">
                    {product.category}
                </p>

                <h3 className="mt-2 text-lg font-bold text-gray-900">
                    {product.name}
                </h3>

                <p className="mt-2 text-xl font-black text-gray-900">
                    ₹{product.price}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                    {product.stock > 0
                        ? `${product.stock} units left`
                        : "Out of stock"}
                </p>


                {/* Wishlist status */}

                {saving && (
                    <p className="mt-3 text-sm text-gray-500">
                        ⏳ Saving...
                    </p>
                )}

                {wishlistAdded && !saving && (
                    <p className="mt-3 text-sm font-medium text-green-600">
                        ♥ Added to Wishlist
                    </p>
                )}

                {error && (
                    <p className="mt-3 text-sm font-medium text-red-600">
                        {error}
                    </p>
                )}


                {/* View Details */}

                <button
                    onClick={() =>
                        navigate(`/products/${product._id}`)
                    }
                    className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                    View Details
                </button>

                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={adding || product.stock < 1}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {adding
                        ? "Adding..."
                        : product.stock < 1
                            ? "Out of Stock"
                            : "Add to Cart"}
                </button>

                {cartMessage && (
                    <p className="mt-2 text-sm text-green-600">
                        {cartMessage}
                    </p>
                )}

                {cartError && (
                    <p className="mt-2 text-sm text-red-600">
                        {cartError}
                    </p>
                )}

            </div>

        </div>
    );
}

export default ProductCard;