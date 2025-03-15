"use client";

import React, { useState, useEffect } from "react";
import { Venue } from "@/types/venue";
import axios from "axios";
import { apiFormData, apiJson } from "@/hook/api";
import { useRouter } from "next/navigation";
import { useUserId } from "@/hook/userid";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";

export default function ManageVenue() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const userId = useUserId();
  const [statusId, setStatusId] = useState<number | null>(null);

  const [venueData, setVenueData] = useState<Partial<Venue>>({
    venue_type: 0,
    venue_name: "",
    location: "",
    category_event: "",
    price: 0,
    area_size: null,
    capacity: 0,
    number_of_rooms: null,
    parking_space: 0,
    outdoor_spaces: null,
    additional_information: "",
    venue_owner: Number(userId),
    status: 0,
  });

  const [files, setFiles] = useState({
    images: [] as File[],
    venue_certification: null as File | null,
    personal_identification: null as File | null,
  });

  // For image preview
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

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
    fieldName: "venue_certification" | "personal_identification"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  // Handle multiple image uploads
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      // Convert FileList to Array and add to existing files
      const newImages = Array.from(selectedFiles);
      setFiles((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));

      // Create preview URLs for the images
      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove image from selection
  const removeImage = (index: number) => {
    setFiles((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNoAuth = () => {
    if (accessToken === null) {
      router.push("/nk1/login");
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await apiJson.get("/status-bookings/");
        if (response.status === 200) {
          const pendingStatus = response.data.find(
            (status: { status: string }) =>
              status.status.toLowerCase() === "pending"
          );

          setVenueData((prev) => ({
            ...prev,
            status: pendingStatus ? pendingStatus.id : 2,
          }));
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };

    fetchStatus();
    handleNoAuth();

    // Clean up preview URLs when component unmounts
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const convertImagesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    return Promise.all(promises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create venue first
      const venueFormData = new FormData();

      // Add venue data
      Object.entries(venueData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          venueFormData.append(key, value.toString());
        }
      });

      // Add certification and ID
      if (files.venue_certification) {
        venueFormData.append("venue_certification", files.venue_certification);
      }

      if (files.personal_identification) {
        venueFormData.append(
          "personal_identification",
          files.personal_identification
        );
      }

      // Add images
      if (files.images) {
        Array.from(files.images).forEach((image) => {
          venueFormData.append("venue_images", image);
        });
      }

      console.log("Venue Data before submit:", venueData);
      console.log("Sending files:", files.images);

      const venueResponse = await apiFormData.post("/venues/", venueFormData);

      if (venueResponse.status === 201 || venueResponse.status === 200) {
        const venueId = venueResponse.data.id;

        // Create venue request without sending images again
        const requestFormData = new FormData();

        // Add venue data
        Object.entries(venueData).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            requestFormData.append(key, value.toString());
          }
        });

        // Link to the venue
        requestFormData.append("venue", venueId);

        // Add certification and ID
        if (files.venue_certification) {
          requestFormData.append(
            "venue_certification",
            files.venue_certification
          );
        }

        if (files.personal_identification) {
          requestFormData.append(
            "personal_identification",
            files.personal_identification
          );
        }
        const requestResponse = await apiFormData.post(
          "/venue-requests/",
          requestFormData
        );

        if (requestResponse.status === 201 || requestResponse.status === 200) {
          // router.push("/nk1/venue/manage");
        } else {
          console.error("Error creating venue request:", requestResponse);
        }
      } else {
        console.error("Error creating venue:", venueResponse);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 text-black">
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

          <div className="flex items-start gap-4">
            <span className="w-32 font-medium pt-2">Images :</span>
            <div className="flex-1">
              <input
                type="file"
                name="images"
                onChange={handleImagesChange}
                accept="image/*"
                className="hidden"
                id="images-upload"
                multiple
                required={files.images.length === 0}
              />
              <label
                htmlFor="images-upload"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer mb-3"
              >
                Upload Images
              </label>

              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`preview ${index}`}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Category :</span>
            <div className="flex gap-2 items-center">
              <select
                name="category_event"
                value={venueData.category_event || ""}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-md"
                required
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
              min="0"
              value={venueData.capacity || ""}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Price :</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="price"
                min="0"
                value={venueData.price}
                onChange={handleInputChange}
                className="w-32 p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Area Size :</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="area_size"
                min="0"
                value={venueData.area_size || ""}
                onChange={handleInputChange}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                required
              />
              <span>m²</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Rooms :</span>
            <input
              type="number"
              name="number_of_rooms"
              min="0"
              value={venueData.number_of_rooms || ""}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Parking :</span>
            <input
              type="number"
              name="parking_space"
              min="0"
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
              min="0"
              value={venueData.outdoor_spaces || ""}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">Additional Info :</span>
            <textarea
              name="additional_information"
              value={venueData.additional_information}
              onChange={handleInputChange}
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
              onChange={(e) => handleFileChange(e, "venue_certification")}
              className="hidden"
              id="certification-upload"
              required
            />
            <label
              htmlFor="certification-upload"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
            >
              {files.venue_certification
                ? files.venue_certification.name
                : "Attach File"}
            </label>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 font-medium">ID Card :</span>
            <input
              type="file"
              name="personal_identification"
              onChange={(e) => handleFileChange(e, "personal_identification")}
              className="hidden"
              id="id-upload"
              required
            />
            <label
              htmlFor="id-upload"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
            >
              {files.personal_identification
                ? files.personal_identification.name
                : "Attach File"}
            </label>
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
            className={`px-6 py-2 rounded-md ${
              venueData.venue_type
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!venueData.venue_type}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
