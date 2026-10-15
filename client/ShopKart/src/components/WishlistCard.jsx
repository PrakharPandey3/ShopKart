import React from "react";
import { useNavigate } from "react-router-dom";

function WishlistCard({ product, onRemove, removing }) {

    const navigate = useNavigate();

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            {/* Image */}

            <img
                src={product.image}
                alt={product.name}
                className="h-56 w-full object-cover"
            />


            <div className="p-5">

                {/* Category */}

                <p className="text-sm font-semibold text-indigo-600">
                    {product.category}
                </p>


                {/* Name */}

                <h3 className="mt-2 text-lg font-bold text-gray-900">
                    {product.name}
                </h3>


                {/* Price */}

                <p className="mt-2 text-xl font-black text-gray-900">
                    ₹{product.price}
                </p>


                {/* Stock */}

                <p className="mt-1 text-sm text-gray-500">
                    {product.stock > 0
                        ? `${product.stock} units left`
                        : "Out of stock"}
                </p>


                {/* Buttons */}

                <div className="mt-5 flex gap-3">

                    <button
                        onClick={() =>
                            navigate(`/products/${product._id}`)
                        }
                        className="flex-1 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                        View Details
                    </button>

                    <button
                        onClick={() => onRemove(product._id)}
                        disabled={removing}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                        {removing ? "Removing..." : "Remove"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default WishlistCard;