"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import useFetchVenues from "@/hook/Venue";
import { Venue } from "@/types/venue";

interface SlidingStates {
  [key: number]: boolean;
}

const AddVenuePage = () => {
  const { venues } = useFetchVenues();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [slidingStates, setSlidingStates] = useState<SlidingStates>({});

  // Toggle all slides when delete mode changes
  useEffect(() => {
    if (venues) {
      const newSlidingStates: SlidingStates = {};
      venues.forEach((venue) => {
        newSlidingStates[venue.id] = isDeleteMode;
      });
      setSlidingStates(newSlidingStates);
    }
  }, [isDeleteMode, venues]);

  const handleDelete = async (venueId: number) => {
    const isConfirmed = window.confirm(
      "จะลบจริงหรอมันหายน้า"
    );

    if (!isConfirmed) {
      return; 
    }

    try {
      const response = await fetch(`http://localhost:8000/venues/${venueId}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Failed to delete venue");
      }
    } catch (error) {
      console.error("Error deleting venue:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex w-full justify-between my-2">
        <p className="text-xl font-semibold text-black">Manage & Add Venue</p>
        <button
          onClick={() => setIsDeleteMode(!isDeleteMode)}
          className={`text-xl font-semibold transition-colors ${
            isDeleteMode ? "text-red-500" : "text-black"
          }`}
        >
          ลบสถานที่
        </button>
      </div>

      {/* Add Venue Card */}
      <Link href="/venue/manage/add" className="text-xl font-semibold">
        <div className="bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer rounded-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-gray-600">เพิ่มสถานที่ของคุณ</span>
          </div>
        </div>
      </Link>

      {/* Existing Venue Cards */}
      {venues?.map((venue: Venue) => (
        <div key={venue.id} className="relative overflow-hidden">
          <div className={`p-6 bg-gray-100 rounded-lg`}>
            <div className="flex justify-between">
              <p className="font-bold text-black mb-2">{venue.venue_name}</p>
              {!isDeleteMode && (
                <Link
                  href={`/venue/${venue.id}/edit`}
                  className="text-[#B67373] underline"
                >
                  Edit
                </Link>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                {/* Venue Image */}
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={venue.image}
                    alt={venue.venue_name}
                    className="object-cover w-full h-full rounded-lg border-4 border-[#B67373]"
                  />
                </div>

                {/* Venue Details */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Owner Name:</span> TEST
                    </p>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>รายละเอียด: {venue.additional_information}</p>
                    <p>เฟอร์นิเจอร์: TEST</p>
                    <p>ประเภทกิจกรรม: {venue.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Button (Absolute positioned) */}
          <button
            onClick={() => handleDelete(venue.id)}
            className={`absolute z-1 right-0 top-0 h-full w-20 bg-red-500 text-white flex items-center justify-center
              transition-transform duration-300 ease-in-out rounded-lg ${
                slidingStates[venue.id] ? "translate-x-0" : "translate-x-full"
              }`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AddVenuePage;
