"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { apiJson } from "@/hook/api";
import { login } from "@/hook/action";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useRole } from "@/hook/role";
import toast from "react-hot-toast";
import { gsap } from "gsap";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUserLogIn, setIsUserLogIn] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const userRole = useRole();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isUserLogIn && userRole) {
      Cookies.set("role", userRole, {
        expires: 365,
        secure: true,
        sameSite: "none",
      });
    }
  }, [isUserLogIn, userRole]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await apiJson.post("/token/", {
        username,
        password,
      });

      if (response.status === 200) {
        const { access, refresh, expired } = response.data;

        dispatch(login(access, refresh, expired, username));
        setIsUserLogIn(true);
        toast.success("Login successful!");
        router.push("/nk1");
      } else {
        console.warn(`Unexpected status code: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Username or password incorrect");
          router.push("/nk1/login");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      } else if (error.request) {
        toast.error(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleBack = () => router.back();
  const handleSignUp = () => router.push("/nk1/signup");

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-64px)] bg-gray-50 px-4">
      <div
        ref={containerRef}
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username / Email */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-600 mb-2"
            >
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F6B96] focus:outline-none text-gray-700"
              placeholder="Enter your username or email"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-600 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F6B96] focus:outline-none text-gray-700"
              placeholder="Enter your password"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="py-2 px-6 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="py-2 px-6 bg-[#3F6B96] hover:bg-[#335473] text-white font-semibold rounded-lg transition"
            >
              Login
            </button>
          </div>
        </form>

        {/* Sign Up Option */}
        <div className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={handleSignUp}
            className="text-[#3F6B96] hover:underline font-semibold"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
