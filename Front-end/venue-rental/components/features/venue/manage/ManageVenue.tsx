"use client";

import React, { useState, useEffect } from "react";
import { Venue } from "@/types/venue";
import axios from "axios";
import { apiFormData } from "@/hook/api";
import { useRouter } from "next/navigation";
import { useAccountId } from "@/hook/userid";

const ManageVenue: React.FC = () => {
  const router = useRouter();

  const accountId = useAccountId();
  console.log(accountId);
  const [venueData, setVenueData] = useState<Partial<Venue>>({
    venue_type: 0,
    venue_name: "",
    image: "",
    location: "",
    category_event: null,
    price: 0,
    area_size: null,
    capacity: 0,
    number_of_rooms: null,
    parking_space: 0,
    outdoor_spaces: null,
    additional_information: "",
    venue_certification: "",
    personal_identification: "",
    venue_owner: Number(accountId),
  });

  const [files, setFiles] = useState({
    image: null as File | null,
    venue_certification: null as File | null,
    personal_identification: null as File | null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setVenueData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof typeof files
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create FormData instance
      const formData = new FormData();

      Object.entries(venueData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      // Make POST request
      const response = await apiFormData.post("/venues/", formData);

      if (response.status === 201 || response.status === 200) {
        // Success
        router.push("/venue/manage");
      }
    } catch (err) {
      console.error("Error creating venue:", err);
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 text-black">
      {/* <div className="flex items-center gap-2 mb-6 text-sm">
        <span className="text-black">Rental Management</span>
        <span className="text-black">&gt;</span>
        <span className="text-gray-900">Add Venue</span>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Venue Type :</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setVenueData((prev) => ({
                    ...prev,
                    venue_type: 1,
                  }))
                }
                className={`px-6 py-[2px] rounded-lg border-black border-[1px] ${
                  venueData.venue_type === 1
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                Large Venue
              </button>
              <button
                type="button"
                onClick={() =>
                  setVenueData((prev) => ({
                    ...prev,
                    venue_type: 2,
                  }))
                }
                className={`px-6 rounded-lg border-black border-[1px] ${
                  venueData.venue_type === 2
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                Room Spaces
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Venue Name :</span>
            <input
              type="text"
              name="venue_name"
              value={venueData.venue_name}
              onChange={handleInputChange}
              placeholder="ex. Home AAA"
              className="flex-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Image :</span>
            <input
              type="file"
              name="image"
              onChange={(e) => handleFileChange(e, "image")}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
            >
              {files.image ? files.image.name : "Attach File"}
            </label>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Location :</span>
            <input
              type="text"
              name="location"
              value={venueData.location || ""}
              onChange={handleInputChange}
              placeholder="Paste URL"
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Category :</span>
            <div className="flex gap-2 items-center">
              <select
                name="category"
                value={venueData.category_event || ""}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select</option>
                <option value="Party">Party</option>
                <option value="Meeting">Meeting</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Capacity :</span>
            <input
              type="number"
              name="capacity"
              value={venueData.capacity || ""}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Price :</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="price"
                value={venueData.price}
                onChange={handleInputChange}
                className="w-32 p-2 border border-gray-300 rounded-md"
                required
              />
              <span>Per</span>
              <select
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-md"
              >
                {/* <option value="">Select</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="month">Month</option> */}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Area Size :</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="area_size"
                value={venueData.area_size || ""}
                onChange={handleInputChange}
                className="flex-1 p-2 border border-gray-300 rounded-md"
              />
              <span>m²</span>
            </div>
          </div>

          {/* Additional fields */}
          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Rooms :</span>
            <input
              type="number"
              name="number_of_rooms"
              value={venueData.number_of_rooms || ""}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Parking :</span>
            <input
              type="number"
              name="parking_space"
              value={venueData.parking_space}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Outdoor Space :</span>
            <input
              type="text"
              name="outdoor_spaces"
              value={venueData.outdoor_spaces || ""}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Additional Info :</span>
            <textarea
              name="additional_information"
              value={venueData.additional_information}
              onChange={(e) =>
                setVenueData((prev) => ({
                  ...prev,
                  additional_information: e.target.value,
                }))
              }
              className="flex-1 p-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Certification :</span>
            <input
              type="file"
              name="venue_certification"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Handle file upload logic here
                }
              }}
              className="flex-1"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">ID Card :</span>
            <input
              type="file"
              name="personal_identification"
              onChange={(e) => {
                const file = e.target.files?.[0];
              }}
              className="flex-1"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageVenue;
