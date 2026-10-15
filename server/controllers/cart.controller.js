import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /cart/:productId
// Add a product, or increase its existing quantity.
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const customer = await Customer.findById(req.cust._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Support customers created before the cart field existed.
        if (!customer.cart) {
            customer.cart = [];
        }

        if (product.stock < 1) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock"
            });
        }

        const existingItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + 1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock"
                });
            }

            existingItem.quantity += 1;
        } else {
            customer.cart.push({
                product: product._id,
                quantity: 1
            });
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id)
            .populate({
                path: "cart.product",
                select: "name description price category image stock"
            });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// GET /cart
// Get the authenticated customer's populated cart.
export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.cust._id)
            .populate({
                path: "cart.product",
                select: "name description price category image stock"
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const cart = (customer.cart || []).filter(
            (item) => item.product !== null
        );

        return res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// PATCH /cart/:productId
// Set a product's quantity to the requested value.
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (
            typeof quantity !== "number" ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be an integer of at least 1"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        const customer = await Customer.findById(req.cust._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const item = (customer.cart || []).find(
            (entry) => entry.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        item.quantity = quantity;

        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id)
            .populate({
                path: "cart.product",
                select: "name description price category image stock"
            });

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        console.error("Update cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// DELETE /cart/:productId
// Remove a product from the authenticated customer's cart.
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const customer = await Customer.findById(req.cust._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const previousLength = (customer.cart || []).length;

        customer.cart = (customer.cart || []).filter(
            (item) => item.product.toString() !== productId
        );

        if (customer.cart.length === previousLength) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id)
            .populate({
                path: "cart.product",
                select: "name description price category image stock"
            });

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};