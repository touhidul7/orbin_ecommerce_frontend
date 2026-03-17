import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/authContext";
import { doRegister } from "../firebase/auth";
import Header from "../components/Header";
import MainFooter from "../components/MainFooter";
const Register = () => {
  const { userLoggedIn } = useAuth() || {};
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSigningUp) return;

  const formData = new FormData(e.target);

  // const name = formData.get("name")?.trim();
  const phone = formData.get("phone")?.trim();
  const password = formData.get("password");

  // if (!name || !phone || !password) {
  //   toast.error("All fields are required");
  //   return;
  // }

  setIsSigningUp(true);

  try {
    const data = await doRegister({
      name: "Customer",
      phone: phone,
      password: password,
      password_confirmation: password,
    });

    toast.success(data.message || "Account created successfully");

    navigate("/login");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to create account"
    );
  } finally {
    setIsSigningUp(false);
  }
};

  if (userLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Header />

      <section className="pt-32 sm:pt-36 lg:pt-44 bg-gray-50 min-h-screen">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mt-6 sm:mt-10 lg:mt-12 text-2xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
              Register Here!
            </h2>
          </div>

          <div className="relative max-w-md mx-auto mt-3 mb-8 sm:mt-12 lg:mt-16">
            <div className="overflow-hidden bg-white rounded-md shadow-md">
              <div className="px-4 py-6 sm:px-8 sm:py-8">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-6">
                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="text-base font-medium text-gray-900"
                      >
                        Phone number
                      </label>
                      <div className="mt-2 relative text-gray-400 focus-within:text-gray-600">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a2 2 0 011.9 1.37l1.1 3.3a2 2 0 01-.45 2.11l-1.47 1.47a16 16 0 006.36 6.36l1.47-1.47a2 2 0 012.11-.45l3.3 1.1A2 2 0 0121 18.72V22a2 2 0 01-2 2h-1C9.163 24 0 14.837 0 4V3a2 2 0 012-2h1z"
                            />
                          </svg>
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          placeholder="Enter phone number"
                          className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 caret-blue-600"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="text-base font-medium text-gray-900"
                      >
                        Password
                      </label>
                      <div className="mt-2 relative text-gray-400 focus-within:text-gray-600">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                            />
                          </svg>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          required
                          minLength={6}
                          placeholder="Enter your password"
                          className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 caret-blue-600"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div>
                      <button
                        type="submit"
                        disabled={isSigningUp}
                        className={`
                          inline-flex items-center justify-center w-full px-4 py-4 
                          text-base font-semibold text-white transition-all duration-200 
                          border border-transparent rounded-md focus:outline-none focus:ring-2 
                          focus:ring-offset-2 focus:ring-[#DF263A]
                          ${
                            isSigningUp
                              ? "bg-red-400 cursor-not-allowed opacity-70"
                              : "bg-[#DF263A] hover:bg-red-700 active:bg-red-800"
                          }
                        `}
                      >
                        {isSigningUp ? "Creating account..." : "Register"}
                      </button>
                    </div>

                    {/* Login link */}
                    <div className="text-center">
                      <p className="text-base text-gray-600">
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          className="font-medium text-orange-500 transition-all duration-200 hover:text-orange-600 hover:underline"
                        >
                          Login here
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Toaster position="top-center" richColors />
      </section>

      <MainFooter />
    </>
  );
};

export default Register;