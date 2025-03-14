"use client";
import React, { useState, useEffect } from "react";
import { apiJson } from "@/hook/api";
import { RootState } from "@/hook/store";
import { useSelector } from "react-redux";

const UpdateInterests = () => {
  const [interests, setInterests] = useState<string[]>([]); 
  const [inputValue, setInputValue] = useState(""); 
  const [message, setMessage] = useState(""); 


  const accessToken = useSelector((state: RootState) => state.auth.accessToken);


  useEffect(() => {
    fetchUserInterests();
  }, []);

  // ฟังก์ชันดึงข้อมูลความสนใจของผู้ใช้
  const fetchUserInterests = async () => {
    try {
      const response = await apiJson.get("/user-details/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setInterests(response.data.interests || []); 
    } catch (error) {
      console.error("Error fetching user interests:", error);
    }
  };

  // ฟังก์ชันเพิ่มความสนใจใหม่
  const addInterest = () => {
    if (inputValue.trim() && !interests.includes(inputValue.trim())) {
      setInterests([...interests, inputValue.trim()]); // เพิ่มความสนใจใหม่
      setInputValue(""); // ล้าง input
    }
  };

  // ฟังก์ชันลบความสนใจ
  const removeInterest = (interestToRemove: any) => {
    setInterests(interests.filter((interest) => interest !== interestToRemove));
  };

  // ฟังก์ชันอัปเดตความสนใจไปยัง Back-end
  const updateInterests = async () => {
    try {
      const response = await apiJson.post(
        "/user-details/update_interests/",
        { interests },
        { headers: { Authorization: `Bearer ${accessToken}` } } // ใช้ accessToken จาก Redux
      );
      setMessage(response.data.message); // แสดงข้อความสำเร็จ
    } catch (error) {
      console.error("Error updating interests:", error);
      setMessage("Failed to update interests."); // แสดงข้อความผิดพลาด
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md text-black">
      <h1 className="text-2xl font-bold mb-4">Update Your Interests</h1>
      <div className="mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your interest"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addInterest}
          className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Interest
        </button>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Your Interests:</h2>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-200 px-3 py-1 rounded-full"
            >
              <span>{interest}</span>
              <button
                onClick={() => removeInterest(interest)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={updateInterests}
        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        Save Interests
      </button>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default UpdateInterests;
