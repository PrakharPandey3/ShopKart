import React, { useEffect, useState } from "react";
import { axiosInstance } from "../services/api";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";

function Products() {
    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("All Categories");

    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchProducts = async () => {
        try {
            // Only show full loading screen on initial load
            if (products.length === 0) {
                setLoading(true);
            } else {
                setIsSearching(true);
            }

            setError("");

            const params = {};

            if (debouncedSearch.trim()) {
                params.search = debouncedSearch;
            }

            if (category !== "All Categories") {
                params.category = category;
            }

            const response = await axiosInstance.get("/products", {
                params,
            });

            setProducts(response.data.products);
        } catch (error) {
            console.error(error);

            setError(
                "Something went wrong while loading products."
            );
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [debouncedSearch, category]);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        ShopKart
                    </p>

                    <h1 className="mt-2 text-4xl font-black text-gray-900">
                        Discover Products
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Find something you'll love.
                    </p>

                </div>
            </div>


            {/* Search + Filter */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">

                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Category */}
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500"
                    >
                        <option>All Categories</option>
                        <option>Electronics</option>
                        <option>Fashion</option>
                        <option>Books</option>
                        <option>Home</option>
                    </select>

                </div>


                {/* Products */}
                <div className="mt-8">

                    {loading && (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <p className="text-lg font-semibold text-gray-500">
                                Loading products...
                            </p>
                        </div>
                    )}

                    {isSearching && (
                        <p className="mb-4 text-sm text-gray-500">
                            Searching...
                        </p>
                    )}


                    {!loading && error && (
                        <div className="rounded-2xl bg-red-50 p-8 text-center">
                            <p className="font-semibold text-red-600">
                                {error}
                            </p>
                        </div>
                    )}


                    {!loading && !error && products.length === 0 && (
                        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                            <div className="text-5xl">
                                🛒
                            </div>

                            <h2 className="mt-4 text-xl font-bold">
                                No products found.
                            </h2>

                            <p className="mt-2 text-gray-500">
                                Try changing your search or category.
                            </p>
                        </div>
                    )}


                    {!loading && !error && products.length > 0 && (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                />
                            ))}

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Products;