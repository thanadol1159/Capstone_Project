"use client";

import React, { useState, useEffect } from "react";
import { Venue } from "@/types/venue";
import { apiFormData, apiJson } from "@/hook/api";
import { useRouter } from "next/navigation";
import { useUserId } from "@/hook/userid";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import {
  X,
  Upload,
  Home,
  MapPin,
  Users,
  DollarSign,
  Square,
  Car,
  FileText,
  User,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManageVenue() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const userId = useUserId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [venueData, setVenueData] = useState<Partial<Venue>>({
    venue_type: 0,
    venue_name: "",
    location: "",
    latitude: 0,
    longitude: 0,
    venue_category: [],
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

  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState({
    images: "",
    venue_certification: "",
    personal_identification: "",
  });

  const validateFiles = () => {
    const errors = {
      images: "",
      venue_certification: "",
      personal_identification: "",
    };

    if (files.images.length === 0) {
      errors.images = "At least one image is required";
    } else if (files.images.length > 10) {
      errors.images = "Maximum 10 images allowed";
    } else {
      for (let i = 0; i < files.images.length; i++) {
        const file = files.images[i];
        if (file.size > 5 * 1024 * 1024) {
          errors.images = `Image ${i + 1} is too large (max 5MB)`;
          break;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          errors.images = `Image ${i + 1} must be JPEG, PNG, or WEBP`;
          break;
        }
      }
    }

    if (!files.venue_certification) {
      errors.venue_certification = "Venue certification is required";
    } else {
      const file = files.venue_certification;
      if (file.size > 5 * 1024 * 1024) {
        errors.venue_certification =
          "Certification file is too large (max 5MB)";
      }
      if (!["application/pdf"].includes(file.type)) {
        errors.venue_certification = "Certification must be PDF";
      }
    }

    if (!files.personal_identification) {
      errors.personal_identification = "ID card is required";
    } else {
      const file = files.personal_identification;
      if (file.size > 5 * 1024 * 1024) {
        errors.personal_identification = "ID card file is too large (max 5MB)";
      }
      if (!["application/pdf"].includes(file.type)) {
        errors.personal_identification = "ID card must be PDF";
      }
    }

    setValidationErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

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
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newImages = Array.from(selectedFiles);
      setValidationErrors((prev) => ({
        ...prev,
        images: "",
      }));
      setFiles((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setFiles((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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
        toast.error("Failed to load status data");
      }
    };

    fetchStatus();
    handleNoAuth();

    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateFiles()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const venueFormData = new FormData();
      venueData.venue_category?.forEach((category) => {
        venueFormData.append("venue_category[]", category);
      });

      Object.entries(venueData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          venueFormData.append(key, value.toString());
        }
      });

      if (files.venue_certification) {
        venueFormData.append("venue_certification", files.venue_certification);
      }

      if (files.personal_identification) {
        venueFormData.append(
          "personal_identification",
          files.personal_identification
        );
      }

      files.images.forEach((image) => {
        venueFormData.append("venue_images", image);
      });

      const venueResponse = await apiFormData.post("/venues/", venueFormData);

      if (venueResponse.status === 201 || venueResponse.status === 200) {
        const venueId = venueResponse.data.id;
        const requestFormData = new FormData();
        venueData.venue_category?.forEach((category) => {
          requestFormData.append("venueRequest_category", category);
        });

        Object.entries(venueData).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            requestFormData.append(key, value.toString());
          }
        });

        requestFormData.append("venue", venueId);

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

        files.images.forEach((image) => {
          requestFormData.append("venueRequest_images[]", image);
        });
        console.log(venueFormData)
        console.log(requestFormData)

        const requestResponse = await apiFormData.post(
          "/venue-requests/",
          requestFormData
        );

        if (requestResponse.status === 201 || requestResponse.status === 200) {
          toast.success("Venue created successfully!");
          router.push("/nk1/venue/manage");
        } else {
          toast.error("Failed to create venue request");
        }
      } else {
        toast.error("Failed to create venue");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred while creating the venue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 text-[#3F6B96]">
      <h1 className="text-2xl font-bold mb-6">Create New Venue</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" color="#3F6B96" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Venue Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Venue Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVenueData({ ...venueData, venue_type: 1 })}
                  className={`px-4 py-2 rounded-md border flex-1 flex items-center justify-center gap-2 ${
                    venueData.venue_type === 1
                      ? "bg-[#3F6B96] text-white hover:bg-[#335473] font-medium"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Large Venue
                </button>
                <button
                  type="button"
                  onClick={() => setVenueData({ ...venueData, venue_type: 2 })}
                  className={`px-4 py-2 rounded-md border flex-1 flex items-center justify-center gap-2 ${
                    venueData.venue_type === 2
                      ? "bg-[#3F6B96] text-white hover:bg-[#335473] font-medium"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Room Space
                </button>
              </div>
            </div>

            {/* Venue Name */}
            <div>
              <label className="flex text-sm font-medium  mb-2">
                Venue Name
              </label>
              <input
                type="text"
                name="venue_name"
                value={venueData.venue_name}
                onChange={handleInputChange}
                placeholder="e.g. Grand Ballroom"
                className="w-full p-2 rounded-md border focus-ring-3 focus:ring-[#3F6B96]"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Category
              </label>
              <select
                value={venueData.venue_category?.[0] || ""}
                onChange={(e) => {
                  setVenueData({
                    ...venueData,
                    venue_category: [e.target.value],
                  });
                }}
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                <option value="party">Party</option>
                <option value="film">Film</option>
                <option value="staycation">Staycation</option>
                <option value="wedding">Wedding</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="text-sm font-medium  mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                min="0"
                value={venueData.capacity || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
                placeholder="Number of people"
              />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" color="#3F6B96" />
            Location Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium  mb-2">Address</label>
              <input
                type="text"
                name="location"
                value={venueData.location || ""}
                onChange={handleInputChange}
                placeholder="Full address"
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                step="any"
                value={venueData.latitude || ""}
                onChange={handleInputChange}
                placeholder="e.g. 13.756331"
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                step="any"
                value={venueData.longitude || ""}
                onChange={handleInputChange}
                placeholder="e.g. 100.501762"
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Venue Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Square className="w-5 h-5" color="#3F6B96" />
            Venue Specifications
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Area Size */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Area Size (sq.m)
              </label>
              <input
                type="number"
                name="area_size"
                min="0"
                value={venueData.area_size || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
                placeholder="Total area in square meters"
              />
            </div>

            {/* Number of Rooms */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Number of Rooms
              </label>
              <input
                type="number"
                name="number_of_rooms"
                min="0"
                value={venueData.number_of_rooms || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
                placeholder="Total number of rooms"
              />
            </div>

            {/* Parking Space */}
            <div>
              <label className="block text-sm font-medium  mb-2 items-center gap-1">
                <Car className="w-4 h-4" />
                Parking Spaces
              </label>
              <input
                type="number"
                name="parking_space"
                min="0"
                value={venueData.parking_space}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
                placeholder="Number of parking spaces"
              />
            </div>

            {/* Outdoor Spaces */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Outdoor Spaces
              </label>
              <input
                type="text"
                name="outdoor_spaces"
                value={venueData.outdoor_spaces || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
                placeholder="Describe outdoor spaces"
              />
            </div>

            {/* Price */}
            <div>
              <label className=" text-sm font-medium  mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Price (THB)
              </label>
              <input
                type="number"
                name="price"
                min="0"
                value={venueData.price}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent"
                required
                placeholder="Price per booking"
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" color="#3F6B96" />
            Venue Images
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium  mb-2">
              Upload Images (JPEG, PNG, WEBP, max 5MB each)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 " />
                  <p className="mb-2 text-sm ">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs ">Up to 10 images</p>
                </div>
                <input
                  type="file"
                  name="images"
                  onChange={handleImagesChange}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  multiple
                />
              </label>
            </div>
            {validationErrors.images && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.images}
              </p>
            )}
          </div>

          {imagePreviewUrls.length > 0 && (
            <div>
              <label className="block text-sm font-medium  mb-2">
                Selected Images ({imagePreviewUrls.length}/10)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`preview ${index}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" color="#3F6B96" />
            Additional Information
          </h2>
          <textarea
            name="additional_information"
            value={venueData.additional_information}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-md focus:ring-3 focus:ring-[#3F6B96] focus:border-transparent min-h-[120px]"
            required
            placeholder="Describe the venue etc."
          />
        </div>

        {/* Documentation Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" color="#3F6B96" />
            Required Documentation
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Venue Certification */}
            <div>
              <label className="block text-sm font-medium  mb-2 items-center gap-1">
                Venue Certification (PDF)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  name="venue_certification"
                  onChange={(e) => handleFileChange(e, "venue_certification")}
                  accept=".pdf"
                  className="hidden"
                  id="certification-upload"
                />
                <label
                  htmlFor="certification-upload"
                  className={`flex-1 flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer ${
                    files.venue_certification
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {files.venue_certification ? (
                    <span className="truncate">
                      {files.venue_certification.name}
                    </span>
                  ) : (
                    "Select PDF file (max 5MB)"
                  )}
                </label>
              </div>
              {validationErrors.venue_certification && (
                <p className="text-red-500 text-sm mt-2">
                  {validationErrors.venue_certification}
                </p>
              )}
            </div>

            {/* Personal Identification */}
            <div>
              <label className="block text-sm font-medium  mb-2 flex items-center gap-1">
                ID Card (PDF)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  name="personal_identification"
                  onChange={(e) =>
                    handleFileChange(e, "personal_identification")
                  }
                  accept=".pdf"
                  className="hidden"
                  id="id-upload"
                />
                <label
                  htmlFor="id-upload"
                  className={`flex-1 flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer ${
                    files.personal_identification
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {files.personal_identification ? (
                    <span className="truncate">
                      {files.personal_identification.name}
                    </span>
                  ) : (
                    "Select PDF file (max 5MB)"
                  )}
                </label>
              </div>
              {validationErrors.personal_identification && (
                <p className="text-red-500 text-sm mt-2">
                  {validationErrors.personal_identification}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/nk1/venue/manage")}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !venueData.venue_type}
            className={`px-6 py-2 bg-[#3F6B96] text-white rounded-md hover:bg-[#335473] transition font-medium ${
              isSubmitting || !venueData.venue_type
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Venue"}
          </button>
        </div>
      </form>
    </div>
  );
}
