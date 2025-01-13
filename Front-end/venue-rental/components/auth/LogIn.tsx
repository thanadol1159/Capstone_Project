"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { apiJson } from "@/hook/api";
import { login } from "@/hook/action";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await apiJson.post("/token/", {
        username,
        password,
      });

      if (response.status === 200) {
        const { access, refresh, expired } = response.data;
        dispatch(login(access, refresh, expired, username));
        router.push("/nk1");
        console.log("Already logged in");
      } else {
        console.warn(`Unexpected status code: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          alert("Username or password incorrect");
        } else {
          console.error(`Error: ${error.response.statusText}`);
          alert("An error occurred. Please try again.");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        console.error("Unexpected error:", error.message);
        alert("Username or password incorrect");
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSignUp = () => {
    router.push("/nk1/signup");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-[50%] max-w-full p-8 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username / Email Field */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Username / Email :
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none text-gray-700"
              placeholder="Enter your username or email"
            />
          </div>

          {/* Password Field */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-40">
              Password :
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none text-gray-700"
              placeholder="Enter your password"
            />
          </div>

          {/* Social Login Buttons */}
          {/* <div className="flex justify-center space-x-4 mt-4">
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
          </div> */}

          {/* Horizontal Line */}
          <div className="border-t border-gray-300 my-4"></div>

          {/* Back and Login Buttons */}
          <div className="flex justify-center mt-6 space-x-10">
            <button
              type="button"
              onClick={handleBack}
              className="py-2 px-12 border rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="py-2 px-12 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-200"
            >
              Login
            </button>
          </div>
        </form>

        {/* Sign Up and Social Login Options */}
        <div className="text-center mt-4">
          <span className="text-gray-700">
            Didn't have an account?{" "}
            <button
              onClick={handleSignUp}
              className="text-[#1A9DB8] font-semibold hover:underline"
            >
              Sign up
            </button>
            {/* {" "}
            or Sign in with */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
