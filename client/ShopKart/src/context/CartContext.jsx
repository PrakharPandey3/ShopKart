import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import { axiosInstance } from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [cartError, setCartError] = useState("");

    // Retrieve the latest cart from MongoDB.
    const refreshCart = useCallback(async () => {
        setCartLoading(true);
        setCartError("");

        try {
            const response = await axiosInstance.get("/cart");
            setCartItems(response.data.cart || []);
        } catch (error) {
            setCartError(
                error.response?.data?.message ||
                "Unable to load your cart."
            );
            throw error;
        } finally {
            setCartLoading(false);
        }
    }, []);

    // Load the authenticated customer's cart once on mount.
    useEffect(() => {
        refreshCart().catch(() => {
            // The error is already stored in cartError.
        });
    }, [refreshCart]);

    // Add one unit. If already present, the backend increments quantity.
    const addToCart = async (productId) => {
        setCartError("");

        try {
            const response = await axiosInstance.post(
                `/cart/${productId}`
            );
            setCartItems(response.data.cart || []);
            return response.data;
        } catch (error) {
            setCartError(
                error.response?.data?.message ||
                "Unable to add this product to your cart."
            );
            throw error;
        }
    };

    // Set an item's quantity.
    const updateQuantity = async (productId, quantity) => {
        setCartError("");

        try {
            const response = await axiosInstance.patch(
                `/cart/${productId}`,
                { quantity }
            );

            setCartItems(response.data.cart || []);
            return response.data;
        } catch (error) {
            setCartError(
                error.response?.data?.message ||
                "Unable to update the quantity."
            );
            throw error;
        }
    };

    // Remove an item.
    const removeFromCart = async (productId) => {
        setCartError("");

        try {
            const response = await axiosInstance.delete(
                `/cart/${productId}`
            );

            setCartItems(response.data.cart || []);
            return response.data;
        } catch (error) {
            setCartError(
                error.response?.data?.message ||
                "Unable to remove this product."
            );
            throw error;
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Derived values: don't store these separately.
    const totalItems = useMemo(
        () => cartItems.reduce(
            (total, item) => total + 1,
            0
        ),
        [cartItems]
    );

    const subtotal = useMemo(
        () => cartItems.reduce(
            (total, item) =>
                total + (item.product?.price || 0) * item.quantity,
            0
        ),
        [cartItems]
    );

    const value = {
        cartItems,
        cartLoading,
        cartError,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }

    return context;
}