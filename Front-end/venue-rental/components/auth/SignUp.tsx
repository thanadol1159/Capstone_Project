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
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const userId = useUserId();
  const userRole = useRole();

  useEffect(() => {
    if (isUserRegistered && userId) {
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
        toast.error("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      const registerResponse = await apiJson.post("/users/", {
        username,
        email,
        password,
        age,
        gender,
        interested: [],
      });

      if (registerResponse.status === 201) {
        toast.success(registerResponse.data.message);

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
      toast.error(
        error.response?.data?.error || "Registration failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white">
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
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-[#3F6B96] focus:outline-none text-gray-700"
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
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-[#3F6B96] focus:outline-none text-gray-700"
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
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-[#3F6B96] focus:outline-none text-gray-700"
              placeholder="Password must be at least 8 characters"
              required
              minLength={8}
              disabled={isSubmitting}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Confirm
              <br />
              Password :
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-[#3F6B96] focus:outline-none text-gray-700"
              placeholder="Repeat your password"
              required
              minLength={8}
              disabled={isSubmitting}
            />
          </div>

          {/* Age Field */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Age :
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-[#3F6B96] focus:outline-none text-gray-700"
              placeholder="Enter your age"
              required
              min="1"
              max="120"
              disabled={isSubmitting}
            />
          </div>

          {/* Gender Field */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Gender :
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-[#3F6B96] focus:outline-none text-gray-700"
              required
              disabled={isSubmitting}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="border-t border-gray-300 my-4"></div>

          <div className="text-center">
            <span className="text-gray-700">
              Already have an account?{" "}
              <Link
                href="/nk1/login"
                className="text-[#3F6B96] font-semibold hover:underline"
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
              className="py-2 px-12  text-white font-semibold rounded-lg bg-[#3F6B96] hover:bg-[#335473] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
