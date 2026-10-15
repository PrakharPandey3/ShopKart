import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
    const {
        cartItems,
        cartLoading,
        cartError,
        totalItems,
        subtotal,
        updateQuantity,
        removeFromCart,
        refreshCart
    } = useCart();

    const [busyItems, setBusyItems] = useState({});
    const [actionError, setActionError] = useState("");
    const navigate = useNavigate();

    const changeQuantity = async (productId, quantity) => {
        setBusyItems((prev) => ({
            ...prev,
            [productId]: true
        }));

        setActionError("");

        try {
            await updateQuantity(productId, quantity);
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                "Unable to update quantity."
            );
        } finally {
            setBusyItems((prev) => ({
                ...prev,
                [productId]: false
            }));
        }
    };

    const handleRemove = async (productId) => {
        setBusyItems((prev) => ({
            ...prev,
            [productId]: true
        }));

        setActionError("");

        try {
            await removeFromCart(productId);
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                "Unable to remove product."
            );
        } finally {
            setBusyItems((prev) => ({
                ...prev,
                [productId]: false
            }));
        }
    };

    if (cartLoading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-gray-50">
                <p className="text-lg font-semibold text-gray-500">
                    Loading your cart...
                </p>
            </main>
        );
    }

    if (cartError && cartItems.length === 0) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Unable to load your cart
                </h1>

                <p className="mt-3 text-red-600">
                    {cartError}
                </p>

                <button
                    onClick={() => refreshCart().catch(() => { })}
                    className="mt-6 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
                >
                    Try Again
                </button>
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
                <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="text-6xl">🛒</div>

                    <h1 className="mt-5 text-3xl font-black text-gray-900">
                        Your cart is empty
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Looks like you haven't added anything yet.
                    </p>

                    <Link
                        to="/products"
                        className="mt-8 inline-block rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600"
                    >
                        Browse Products
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        SHOPKART
                    </p>

                    <h1 className="mt-2 text-4xl font-black text-gray-900">
                        My Cart
                    </h1>

                    <p className="mt-2 text-gray-500">
                        {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
                    </p>
                </div>

                {actionError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {actionError}
                    </div>
                )}

                <div className="grid items-start gap-8 lg:grid-cols-3">

                    {/* Cart items */}
                    <section className="space-y-4 lg:col-span-2">
                        {cartItems.map((item) => {
                            const product = item.product;

                            if (!product) return null;

                            const busy = Boolean(
                                busyItems[product._id]
                            );

                            return (
                                <article
                                    key={product._id}
                                    className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-36 w-full rounded-xl bg-gray-100 object-contain sm:w-36"
                                    />

                                    <div className="flex flex-1 flex-col">
                                        <p className="text-sm text-indigo-600">
                                            {product.category}
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold text-gray-900">
                                            {product.name}
                                        </h2>

                                        <p className="mt-2 font-semibold text-gray-900">
                                            ₹{product.price.toLocaleString("en-IN")}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {product.stock} units available
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center gap-3">

                                            <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                                                <button
                                                    type="button"
                                                    disabled={busy || item.quantity <= 1}
                                                    onClick={() =>
                                                        changeQuantity(
                                                            product._id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="px-4 py-2 font-bold hover:bg-gray-100 disabled:opacity-40"
                                                    aria-label={`Decrease ${product.name} quantity`}
                                                >
                                                    −
                                                </button>

                                                <span className="min-w-10 text-center font-semibold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        busy ||
                                                        item.quantity >= product.stock
                                                    }
                                                    onClick={() =>
                                                        changeQuantity(
                                                            product._id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="px-4 py-2 font-bold hover:bg-gray-100 disabled:opacity-40"
                                                    aria-label={`Increase ${product.name} quantity`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() =>
                                                    handleRemove(product._id)
                                                }
                                                className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                                            >
                                                {busy ? "Updating..." : "Remove"}
                                            </button>
                                        </div>

                                        <p className="mt-4 text-sm text-gray-500">
                                            Item total:{" "}
                                            <span className="font-bold text-gray-900">
                                                ₹{(
                                                    product.price * item.quantity
                                                ).toLocaleString("en-IN")}
                                            </span>
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    {/* Order summary */}
                    <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                        <h2 className="text-xl font-bold text-gray-900">
                            Order Summary
                        </h2>

                        <div className="mt-6 flex justify-between text-gray-600">
                            <span>Total items</span>
                            <span>{totalItems}</span>
                        </div>

                        <div className="mt-4 flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-gray-900">
                                ₹{subtotal.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <p className="mt-4 text-sm text-gray-500">
                            Shipping and final charges will be calculated at checkout.
                        </p>

                        <div className="my-6 border-t border-gray-200" />

                        <div className="flex justify-between text-lg font-black text-gray-900">
                            <span>Subtotal</span>
                            <span>
                                ₹{subtotal.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/checkout")}
                            disabled={cartItems.length === 0}
                            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Proceed to Checkout
                        </button>

                        <Link
                            to="/products"
                            className="mt-4 block text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            Continue Shopping
                        </Link>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default Cart;