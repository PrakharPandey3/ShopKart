
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    axiosInstance
      .get("/orders")
      .then((response) => {
        if (active) setOrders(response.data.orders || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            "Unable to load your orders."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="p-8">Loading your orders...</p>;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <p role="alert" className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center">
          <p className="text-lg font-semibold">
            You have not placed any orders yet.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order._id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="break-all font-semibold">{order._id}</p>

                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xl font-extrabold">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-sm">
                    Payment: {order.paymentStatus}
                  </p>
                  <p className="text-sm">
                    Status: {order.status}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t pt-4">
                {order.items.map((item, index) => (
                  <div
                    key={`${order._id}-${index}`}
                    className="flex justify-between gap-4 py-2 text-sm"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to={`/orders/${order._id}`}
                className="mt-4 inline-block font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View details →
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
