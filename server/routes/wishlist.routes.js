import express from "express";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} from "../controllers/wishlist.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const wrouter = express.Router();


// Add product
wrouter.post(
    "/:productId",
    isAuthenticated,
    addToWishlist
);


// Get wishlist
wrouter.get(
    "/",
    isAuthenticated,
    getWishlist
);


// Remove product
wrouter.delete(
    "/:productId",
    isAuthenticated,
    removeFromWishlist
);


export default wrouter;