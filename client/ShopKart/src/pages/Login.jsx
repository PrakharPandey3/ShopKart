import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from '../services/api.js';

function Login() {

    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axiosInstance.post('/customers/login', form);

            console.log("Customer Logged In");
            navigate('/home');

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage: "url('/stars.jpg')",
            }}
        >

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Register Form */}
            <div className="relative z-10 w-full max-w-md px-8 py-10">

                {/* Camera / Profile Icon */}
                <div className="flex justify-center mb-16">
                    <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-5xl">
                            📷
                        </span>
                    </div>
                </div>

                <form
                    className="space-y-7"
                    onSubmit={handleSubmit}
                >

                    {/* Email */}
                    <div className="flex items-center border-b border-white/80 pb-3">

                        <span className="text-white text-xl mr-5">
                            ✉
                        </span>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Your Email Address"
                            className="w-full bg-transparent text-white placeholder-white/90 outline-none text-base"
                        />

                    </div>


                    {/* Password */}
                    <div className="flex items-center border-b border-white/80 pb-3">

                        <span className="text-white text-xl mr-5">
                            🔒
                        </span>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full bg-transparent text-white placeholder-white/90 outline-none text-base"
                        />

                    </div>


                    {/* Register Button */}
                    <button
                        type="submit"
                        className="w-full mt-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg transition duration-200"
                    >
                        LOGIN
                    </button>

                </form>


                {/* Login Link */}
                <p className="text-center text-white/80 font-medium text-lg mt-16">

                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        className="text-white hover:text-red-400 transition"
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Login;