import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get(
          `/products/${id}`
        );

        setProduct(response.data.product);
      } catch (error) {
        console.error(error);

        setError(
          "Something went wrong while loading the product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-semibold text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>No product found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        <button
          onClick={() => navigate("/products")}
          className="mb-8 font-semibold text-indigo-600"
        >
          ← Back to Products
        </button>

        <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">

          {/* Image */}
          <div className="flex min-h-[400px] items-center justify-center bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="h-full max-h-[500px] w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-8 md:p-12">

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
              {product.category}
            </span>

            <h1 className="mt-5 text-4xl font-black text-gray-900">
              {product.name}
            </h1>

            <p className="mt-6 text-3xl font-extrabold text-indigo-600">
              ₹{product.price}
            </p>

            <p className="mt-6 leading-7 text-gray-600">
              {product.description}
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="font-semibold">
                Stock
              </p>

              <p className="mt-1 text-gray-600">
                {product.stock > 0
                  ? `${product.stock} units available`
                  : "Out of stock"}
              </p>
            </div>

            <button
              disabled={product.stock === 0}
              className="mt-8 w-full rounded-xl bg-indigo-600 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Add to Cart
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;