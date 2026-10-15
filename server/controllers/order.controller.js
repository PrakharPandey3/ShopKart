
import mongoose from "mongoose";
import crypto from "crypto";

import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import razorpay from "../config/razorpay.js";

const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object") {
    return "Shipping address is required.";
  }

  const requiredFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode",
  ];

  for (const field of requiredFields) {
    if (
      typeof address[field] !== "string" ||
      !address[field].trim()
    ) {
      return `${field} is required.`;
    }
  }

  if (!/^\d{10}$/.test(address.phone.trim())) {
    return "Phone must contain exactly 10 digits.";
  }

  if (!/^\d{6}$/.test(address.pincode.trim())) {
    return "Pincode must contain exactly 6 digits.";
  }

  return null;
};

// POST /orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
  let shopKartOrder;

  try {
    const addressError = validateShippingAddress(
      req.body.shippingAddress
    );

    if (addressError) {
      return res.status(400).json({
        success: false,
        message: addressError,
      });
    }

    const customer = await Customer.findById(req.cust._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Always use current Product documents and prices.
    for (const cartItem of customer.cart) {
      if (
        !Number.isInteger(cartItem.quantity) ||
        cartItem.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart quantity.",
        });
      }

      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists.",
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      if (
        !Number.isFinite(product.price) ||
        product.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image || "",
      });

      totalAmount += product.price * cartItem.quantity;
    }

    totalAmount = Number(totalAmount.toFixed(2));

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total must be greater than zero.",
      });
    }

    // Save a pending ShopKart order first.
    shopKartOrder = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: req.body.shippingAddress.fullName.trim(),
        phone: req.body.shippingAddress.phone.trim(),
        addressLine1: req.body.shippingAddress.addressLine1.trim(),
        city: req.body.shippingAddress.city.trim(),
        state: req.body.shippingAddress.state.trim(),
        pincode: req.body.shippingAddress.pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // Razorpay expects the amount in paise.
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: shopKartOrder._id.toString(),
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(201).json({
      success: true,
      message: "Payment order created.",
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      totalAmount: shopKartOrder.totalAmount,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    // Do not delete the cart when order creation fails.
    // If a ShopKart order was already saved, it remains pending.
    return res.status(500).json({
      success: false,
      message: "Unable to create payment order.",
    });
  }
};

// POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid payment details.",
      });
    }

    // The order must belong to the authenticated customer.
    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.cust._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Make repeated verification requests safe.
    if (order.paymentStatus === "PAID") {
      if (order.razorpayPaymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified.",
          order,
        });
      }

      return res.status(409).json({
        success: false,
        message: "This order has already been paid.",
      });
    }

    // Use the Razorpay order ID stored in MongoDB.
    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID mismatch.",
      });
    }

    const signaturePayload =
      `${order.razorpayOrderId}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signaturePayload)
      .digest();

    let suppliedSignature;

    try {
      suppliedSignature = Buffer.from(
        razorpay_signature,
        "hex"
      );
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    if (
      suppliedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        expectedSignature,
        suppliedSignature
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Verify that the payment exists and is captured before
    // marking the order paid.
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment has not been successfully captured.",
      });
    }

    // Re-read the customer and confirm the cart still contains
    // the purchased quantities before clearing it.
    const customer = await Customer.findById(req.cust._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Only mark paid after signature and captured-payment checks.
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    // Clear only the items purchased in this order.
    // Preserve any new items added to the cart meanwhile.
    const purchasedQuantities = new Map(
      order.items.map((item) => [
        item.product.toString(),
        item.quantity,
      ])
    );

    const remainingCart = [];

    for (const cartItem of customer.cart || []) {
      const productId = cartItem.product.toString();
      const purchasedQuantity = purchasedQuantities.get(productId);

      if (!purchasedQuantity) {
        remainingCart.push(cartItem);
        continue;
      }

      const remainingQuantity =
        cartItem.quantity - purchasedQuantity;

      if (remainingQuantity > 0) {
        remainingCart.push({
          product: cartItem.product,
          quantity: remainingQuantity,
        });
      }

      purchasedQuantities.delete(productId);
    }

    customer.cart = remainingCart;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed.",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
};

// GET /orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.cust._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders.",
    });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    // Filtering by customer ID prevents access to other customers' orders.
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.cust._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order details.",
    });
  }
};
