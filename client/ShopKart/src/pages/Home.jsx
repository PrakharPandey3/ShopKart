import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../services/api';
import { useCart } from '../context/CartContext';

function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [wishlistState, setWishlistState] = useState({});
  const { addToCart } = useCart();
  const [addingProductId, setAddingProductId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/customers/logout");

      if (response.data.success) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleWishlist = async (productId) => {
    if (wishlistState[productId] === "saving" ||
      wishlistState[productId] === "added") {
      return;
    }

    setWishlistState((prev) => ({
      ...prev,
      [productId]: "saving",
    }));

    try {
      await axiosInstance.post(`/wishlist/${productId}`);

      setWishlistState((prev) => ({
        ...prev,
        [productId]: "added",
      }));
    } catch (error) {
      // A 409 means the product is already saved.
      if (error.response?.status === 409) {
        setWishlistState((prev) => ({
          ...prev,
          [productId]: "added",
        }));
      } else {
        console.error("Failed to add to wishlist:", error);

        setWishlistState((prev) => ({
          ...prev,
          [productId]: "error",
        }));
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  //fetch
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (products.length === 0) {
          setLoading(true);
        } else {
          setIsSearching(true);
        }

        setError("");

        const response = await axiosInstance.get("/products", {
          params: {
            search: debouncedSearch,
          },
        });

        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">


      {/* ================= HERO ================= */}
      <main>

        <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-6 py-14 text-white shadow-xl sm:px-12 lg:px-16">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-32 right-32 h-72 w-72 rounded-full bg-white/5" />

            <div className="relative max-w-2xl">

              <span className="mb-5 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                ✨ New arrivals are here
              </span>

              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Shop smarter.
                <br />
                Live better.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100 sm:text-lg">
                Discover products you'll love at prices you'll appreciate.
                Everything you need, all in one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">

                <button
                  onClick={() => navigate("/products")}
                  className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Shop Now →
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Explore Categories
                </button>

              </div>

            </div>
          </div>

        </section>


        {/* ================= PRODUCTS ================= */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="mb-7 flex items-end justify-between">

            <div>
              <p className="text-sm font-semibold text-indigo-600">
                TRENDING NOW
              </p>

              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                Popular picks
              </h2>
            </div>

            <button
              onClick={() => navigate("/products")}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </button>

          </div>


          {/* Loading */}
          {isSearching && (
            <p className="text-sm text-gray-500">
              Searching...
            </p>
          )}


          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-600">
                {error}
              </p>
            </div>
          )}


          {/* Empty */}
          {!loading && !error && products.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">
                🛒
              </div>

              <h2 className="mt-4 text-xl font-bold">
                No products found.
              </h2>

              <p className="mt-2 text-gray-500">
                There are currently no products available.
              </p>
            </div>
          )}

          {cartMessage && (
            <p role="status" className="mb-4 text-sm text-gray-600">
              {cartMessage}
            </p>
          )}

          {/* Dynamic Products */}
          {!loading && !error && products.length > 0 && (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {products.slice(0, 4).map((product) => (

                <div
                  key={product._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Product Image */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
                      {product.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleWishlist(product._id)}
                      disabled={
                        wishlistState[product._id] === "saving" ||
                        wishlistState[product._id] === "added"
                      }
                      title={
                        wishlistState[product._id] === "added"
                          ? "Added to wishlist"
                          : "Add to wishlist"
                      }
                      aria-label={`Add ${product.name} to wishlist`}
                      className="absolute right-3 top-3 rounded-full bg-white p-2 text-xl text-gray-500 shadow-sm transition hover:text-red-500 disabled:cursor-not-allowed"
                    >
                      {wishlistState[product._id] === "saving"
                        ? "⏳"
                        : wishlistState[product._id] === "added"
                          ? "♥"
                          : "♡"}
                    </button>

                  </div>


                  {/* Product Details */}
                  <div className="p-5">

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      ShopKart
                    </p>

                    <h3 className="mt-1 line-clamp-2 font-bold text-gray-900">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-lg font-extrabold">
                      ₹{product.price}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {product.stock > 0
                        ? `${product.stock} units left`
                        : "Out of stock"}
                    </p>

                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="mt-4 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
                    >
                      View Details
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="mt-4 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
                    >
                      View Details
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      disabled={
                        addingProductId === product._id ||
                        product.stock < 1
                      }
                      onClick={async () => {
                        setAddingProductId(product._id);
                        setCartMessage("");

                        try {
                          await addToCart(product._id);
                          setCartMessage(`${product.name} added to cart!`);
                        } catch (error) {
                          setCartMessage(
                            error.response?.data?.message ||
                            "Unable to add product to cart."
                          );
                        } finally {
                          setAddingProductId(null);
                        }
                      }}
                      className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {addingProductId === product._id
                        ? "Adding..."
                        : product.stock < 1
                          ? "Out of Stock"
                          : "Add to Cart"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ================= PROMO ================= */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gray-900 px-8 py-10 text-center text-white sm:flex-row sm:text-left">

            <div>

              <p className="text-sm font-semibold text-indigo-400">
                SHOPKART EXCLUSIVE
              </p>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Get 20% off your first order
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Use code{" "}
                <span className="font-bold text-white">
                  WELCOME20
                </span>{" "}
                at checkout.
              </p>

            </div>

            <button
              onClick={() => navigate("/products")}
              className="shrink-0 rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              Start Shopping →
            </button>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">

          <div>
            © 2026 <span className="font-semibold text-gray-800">ShopKart</span>.
            All rights reserved.
          </div>

          <div className="flex gap-6">

            <button className="hover:text-indigo-600">
              Privacy
            </button>

            <button className="hover:text-indigo-600">
              Terms
            </button>

            <button className="hover:text-indigo-600">
              Contact
            </button>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;