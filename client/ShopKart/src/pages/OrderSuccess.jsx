
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosInstance } from "../services/api";

export default function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    axiosInstance
      .get(`/orders/${id}`)
      .then((response) => {
        if (active) setOrder(response.data.order);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            "Unable to load order details."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <p className="p-8">Loading order confirmation...</p>;
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p role="alert" className="text-red-600">
          {error || "Order not found."}
        </p>
        <Link to="/orders" className="mt-4 inline-block text-indigo-600">
          View my orders
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="text-5xl">✅</div>

        <h1 className="mt-4 text-3xl font-extrabold">
          Order placed successfully!
        </h1>

        <p className="mt-3 text-gray-600">
          Your payment has been verified and your order is saved.
        </p>

        <div className="mt-8 rounded-xl bg-gray-50 p-5 text-left">
          <p className="break-all text-sm text-gray-500">
            Order ID
          </p>
          <p className="font-semibold">{order._id}</p>

          <div className="mt-4 flex justify-between gap-4">
            <span>Total</span>
            <span className="font-bold">
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-3 flex justify-between gap-4">
            <span>Payment</span>
            <span className="font-semibold">
              {order.paymentStatus}
            </span>
          </div>

          <div className="mt-3 flex justify-between gap-4">
            <span>Order status</span>
            <span className="font-semibold">{order.status}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/orders"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white"
          >
            View my orders
          </Link>

          <Link
            to="/products"
            className="rounded-xl border px-6 py-3 font-semibold"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
