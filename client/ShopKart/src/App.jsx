import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import OrderDetails from "./pages/OrderDetails";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";

import "./App.css";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ========================= */}
                {/* PUBLIC ROUTES */}
                {/* ========================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ========================= */}
                {/* AUTHENTICATION CHECK */}
                {/* ========================= */}

                <Route element={<ProtectedRoute />}>

                    {/* ========================= */}
                    {/* NAVBAR + PROTECTED PAGES */}
                    {/* ========================= */}

                    <Route element={<ProtectedLayout />}>

                        <Route
                            path="/home"
                            element={<Home />}
                        />

                        <Route
                            path="/products"
                            element={<Products />}
                        />

                        <Route
                            path="/products/:id"
                            element={<ProductDetails />}
                        />

                        <Route
                            path="/wishlist"
                            element={<Wishlist />}
                        />

                        <Route
                            path="/cart"
                            element={<Cart />}
                        />

                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:id" element={<OrderDetails />} />
                        <Route path="/order-success/:id" element={<OrderSuccess />} />

                    </Route>

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;