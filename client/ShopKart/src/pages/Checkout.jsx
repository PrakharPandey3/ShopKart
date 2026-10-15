
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../services/api";
import { useCart } from "../context/CartContext";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartLoading,
    refreshCart,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const items = cartItems || [];

  const total = items.reduce((sum, item) => {
    const product = item.product;
    if (!product) return sum;

    return sum + product.price * item.quantity;
  }, 0);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateAddress = () => {
    for (const [field, value] of Object.entries(address)) {
      if (!value.trim()) {
        return `${field} is required.`;
      }
    }

    if (!/^\d{10}$/.test(address.phone.trim())) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      return "Pincode must contain exactly 6 digits.";
    }

    return "";
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateAddress();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      // The backend calculates the authoritative amount.
      const response = await axiosInstance.post(
        "/orders/create-payment-order",
        { shippingAddress: address }
      );

      const data = response.data;

      if (!data.success || !data.razorpayOrderId) {
        throw new Error("Unable to create payment order.");
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart purchase",
        order_id: data.razorpayOrderId,

        prefill: {
          name: address.fullName,
          contact: address.phone,
        },

        theme: {
          color: "#4f46e5",
        },

        handler: async (paymentResponse) => {
          try {
            const verification = await axiosInstance.post(
              "/orders/verify-payment",
              {
                shopKartOrderId: data.shopKartOrderId,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            if (!verification.data.success) {
              throw new Error("Payment verification failed.");
            }

            // Sync global cart state only after backend success.
            await refreshCart();
            clearCart();

            navigate(`/order-success/${data.shopKartOrderId}`, {
              replace: true,
            });
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment verification failed. Please check your orders before retrying."
            );
          }
        },

        modal: {
          ondismiss: () => {
            setError(
              "Checkout was closed. Your cart has not been cleared."
            );
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", (failure) => {
        setError(
          failure.error?.description ||
          "Payment failed. Your cart has been preserved."
        );
      });

      paymentObject.open();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to start checkout."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return <p className="p-8">Loading your cart...</p>;
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link
          to="/products"
          className="mt-4 inline-block text-indigo-600"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold">
        Checkout
      </h1>

      <form
        onSubmit={handlePlaceOrder}
        className="grid gap-8 md:grid-cols-2"
      >
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            Shipping details
          </h2>

          <div className="space-y-4">
            {[
              ["fullName", "Full name"],
              ["phone", "Phone number"],
              ["addressLine1", "Address"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"],
            ].map(([name, label]) => (
              <label key={name} className="block">
                <span className="mb-1 block text-sm font-medium">
                  {label}
                </span>

                <input
                  name={name}
                  value={address[name]}
                  onChange={handleChange}
                  autoComplete={
                    name === "fullName"
                      ? "name"
                      : name === "phone"
                        ? "tel"
                        : "off"
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                  required
                />
              </label>
            ))}
          </div>
        </section>

        <section className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            Order summary
          </h2>

          <div className="space-y-4">
            {items.map((item) => {
              const product = item.product;

              if (!product) return null;

              return (
                <div
                  key={product._id}
                  className="flex justify-between gap-4"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      ₹{product.price} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{(
                      product.price * item.quantity
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span>
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Final pricing and stock are verified by the server.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Preparing checkout..." : "Pay with Razorpay"}
          </button>

          <Link
            to="/cart"
            className="mt-4 block text-center text-sm text-gray-600 hover:text-indigo-600"
          >
            Back to cart
          </Link>
        </section>
      </form>
    </main>
  );
}
