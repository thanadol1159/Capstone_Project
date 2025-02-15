"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { apiJson } from "@/hook/api";
import { login } from "@/hook/action";
import { useRouter } from "next/navigation";
import { useUserId } from "@/hook/userid";
import { useRole } from "@/hook/role";
import Cookies from "js-cookie";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const userId = useUserId();
  const userRole = useRole();

  useEffect(() => {
    if (isUserRegistered && userId) {
      // const postUserDetails = async () => {
      //   const today = new Date();
      //   const formattedDate = today.toISOString().split("T")[0];

      //   try {
      //     const userDetailResponse = await apiJson.post("/user-details/", {
      //       first_name: "-",
      //       last_name: "-",
      //       phone_number: "-",
      //       email,
      //       province: "-",
      //       district: "-",
      //       sub_district: "-",
      //       address: "-",
      //       dob: formattedDate,
      //       user: userId,
      //       role: 2,
      //     });

      //     if (userDetailResponse.status === 201) {
      //       console.log("User details created successfully");
      //       router.push("/");
      //     }
      //   } catch (error: any) {
      //     console.error("Failed to create user details:", error);
      //     alert("Failed to create user details. Please try again.");
      //   }
      // };

      // postUserDetails();
      if (userRole) {
        Cookies.set("role", userRole, {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });
      } else {
        console.warn("User role is null, cookie not set.");
      }
    }
  }, [isUserRegistered, userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      const registerResponse = await apiJson.post("/users/", {
        username,
        email,
        password,
      });

      if (registerResponse.status === 201) {
        alert(registerResponse.data.message);

        const tokenResponse = await apiJson.post("/token/", {
          username,
          password,
        });

        const { access, refresh, expired } = tokenResponse.data;

        dispatch(login(access, refresh, expired, username));
        router.push("/nk1");

        setIsUserRegistered(true);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      alert(
        error.response?.data?.error || "Registration failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-[50%] max-w-full p-8 bg-white">
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              placeholder="Password must be at least 8 characters"
              required
              minLength={8}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="border-t border-gray-300 my-4"></div>

          <div className="text-center">
            <span className="text-gray-700">
              Already have an account?{" "}
              <Link
                // onClick={handleLogin}
                href="/nk1/login"
                className="text-[#1A9DB8] font-semibold hover:underline"
                // disabled={isSubmitting}
              >
                Log in
              </Link>
            </span>
          </div>

          <div className="flex justify-center mt-6 space-x-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="py-2 px-12 border rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="py-2 px-12 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
