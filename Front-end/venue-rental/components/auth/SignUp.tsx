"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { apiJson } from "@/hook/api";
import { login } from "@/hook/action";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await apiJson.post("/accounts/", {
        username,
        email,
        password,
      });

      const response = await apiJson.post("/token/", {
        username,
        password,
      });

      const { access, refresh, expired } = response.data;
      dispatch(login(access, refresh, expired, username));

      router.push("/venue-rental");
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Registration failed. Please try again.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-[80%] max-w-full p-8 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Username :
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none text-gray-700"
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Email Field */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Email :
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none text-gray-700"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Password :
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none text-gray-700"
              placeholder="Create a password"
              required
              minLength={8}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Confirm Password :
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none text-gray-700"
              placeholder="Repeat your password"
              required
              minLength={8}
            />
          </div>

          {/* Horizontal Line */}
          <div className="border-t border-gray-300 my-4"></div>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-gray-700">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-[#1A9DB8] font-semibold hover:underline"
              >
                Log in
              </a>
            </span>
          </div>

          {/* Social Sign Up Options */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200"
            >
              Gmail
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200"
            >
              Line
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200"
            >
              GitHub
            </button>
          </div>

          {/* Back and Sign Up Buttons */}
          <div className="flex justify-end mt-6 space-x-10">
            <button
              type="button"
              onClick={handleBack}
              className="py-2 px-4 border rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-200"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
