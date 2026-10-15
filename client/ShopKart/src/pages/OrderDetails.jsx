
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosInstance } from "../services/api";

export default function OrderDetails() {
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
            "Unable to load order."
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

  if (loading) return <p className="p-8">Loading order...</p>;

  if (error || !order) {
    return (
      <main className="p-8">
        <p role="alert" className="text-red-600">
          {error || "Order not found."}
        </p>
        <Link to="/orders" className="text-indigo-600">
          Back to my orders
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/orders" className="text-indigo-600">
        ← Back to my orders
      </Link>

      <h1 className="mt-5 text-3xl font-extrabold">Order details</h1>
      <p className="mt-2 break-all text-sm text-gray-500">
        Order ID: {order._id}
      </p>

      <section className="mt-6 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">Items</h2>

        {order.items.map((item, index) => (
          <div
            key={`${order._id}-${index}`}
            className="flex justify-between gap-4 border-b py-4 last:border-b-0"
          >
            <div className="flex gap-3">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}

              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>
            </div>

            <p className="font-semibold">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </p>
          </div>
        ))}

        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>
          <span>
            ₹{order.totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">Shipping address</h2>
        <p className="mt-3">{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.addressLine1}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state}
        </p>
        <p>{order.shippingAddress.pincode}</p>

        <div className="mt-5 border-t pt-4">
          <p>Payment: <strong>{order.paymentStatus}</strong></p>
          <p className="mt-1">
            Status: <strong>{order.status}</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
