import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";


// ========================================
// ADD PRODUCT TO WISHLIST
// POST /wishlist/:productId
// ========================================

export const addToWishlist = async (req, res) => {
    try {

        const { productId } = req.params;

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Get authenticated customer
        const customer = req.cust;

        // Check duplicate
        const alreadyExists = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        // Add product ID
        customer.wishlist.push(productId);

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// ========================================
// GET CURRENT CUSTOMER'S WISHLIST
// GET /wishlist
// ========================================

export const getWishlist = async (req, res) => {
    try {

        const customer = await Customer
            .findById(req.cust._id)
            .populate({
                path: "wishlist",
                select: "name price category image stock description"
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// ========================================
// REMOVE PRODUCT FROM WISHLIST
// DELETE /wishlist/:productId
// ========================================

export const removeFromWishlist = async (req, res) => {
    try {

        const { productId } = req.params;

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Get authenticated customer
        const customer = req.cust;

        // Check whether product exists in wishlist
        const exists = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist"
            });
        }

        // Remove product
        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};