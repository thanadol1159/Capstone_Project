"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Venue } from "@/types/venue";
import { apiFormData } from "@/hook/api";
import { apiJson } from "@/hook/api";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import "swiper/css/navigation";
import { X } from "lucide-react";

export default function VenueEditPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [venue, setVenue] = useState<Venue | null>(null);

  // Updated files state to match ManageVenue component
  const [files, setFiles] = useState({
    images: [] as File[],
  });

  // For image preview
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
    { id: number; image: string }[]
  >([]);

  useEffect(() => {
    const fetchVenueDetail = async () => {
      try {
        const { data } = await apiJson.get(`/venues/${params.id}/`);
        setVenue(data);
        setExistingImages(data.venue_images || []);
      } catch (error) {
        console.error("Error fetching venue:", error);
      }
    };

    if (params.id) {
      fetchVenueDetail();
    }
  }, [params.id]);

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

  // Remove existing image
  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue) return;

    try {
      const formData = new FormData();

      // Append text fields
      const fieldsToUpdate = [
        "venue_name",
        "venue_type",
        "price",
        "capacity",
        "parking_space",
        "additional_information",
        "area_size",
        "category_event",
        "location",
        "number_of_rooms",
        "outdoor_spaces",
        "status",
        "latitude",
        "longitude",
      ];

      fieldsToUpdate.forEach((field) => {
        if (venue[field as keyof Venue] !== undefined) {
          formData.append(field, String(venue[field as keyof Venue]));
        }
      });

      // Append existing images
      existingImages.forEach((img) => {
        formData.append("venue_images_ids", String(img.id));
      });

      // Append new images
      files.images.forEach((image) => {
        formData.append("venue_images", image);
      });

      await apiFormData.put(`/venues/${params.id}/`, formData);

      router.push(`/nk1/venue/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating venue:", error);
    }
  };

  const handleCancel = () => {
    router.push("/nk1/venue/manage");
  };

  const handleNoAuth = () => {
    if (accessToken === null) {
      router.push("/nk1/login");
    }
  };

  useEffect(() => {
    handleNoAuth();

    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (!venue) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-lg mx-auto p-2 text-black">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Preview and Upload */}
        <div className="grid grid-cols-3 gap-4">
          {existingImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.image}
                alt="Venue"
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(img.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div>
          <label className="block font-medium">Upload Images</label>
          <input
            type="file"
            name="images"
            onChange={handleImagesChange}
            accept="image/*"
            multiple
            className="mt-2 block w-full border border-gray-300 p-2 rounded-md"
          />
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-2">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`preview ${index}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Venue Type */}
        <div className="space-y-2">
          <div className="text-sm font-bold">Venue Type :</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVenue({ ...venue, venue_type: 1 })}
              className={`px-4 py-2 rounded-md border ${
                venue.venue_type === 1
                  ? "bg-black text-white hover:bg-gray-800 font-bold"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Large Venue
            </button>
            <button
              type="button"
              onClick={() => setVenue({ ...venue, venue_type: 2 })}
              className={`px-4 py-2 rounded-md border ${
                venue.venue_type === 2
                  ? "bg-black text-white hover:bg-gray-800 font-bold"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Room Space
            </button>
          </div>
        </div>

        {/* Venue Name */}
        <div className="space-y-2">
          <div className="text-sm font-bold">Venue Name :</div>
          <input
            type="text"
            value={venue.venue_name}
            onChange={(e) => setVenue({ ...venue, venue_name: e.target.value })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Latitude and Longitude */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-bold">Latitude:</div>
            <input
              type="number"
              step="0.000001"
              value={venue.latitude || ""}
              onChange={(e) =>
                setVenue({ ...venue, latitude: Number(e.target.value) })
              }
              className="w-full p-2 border rounded-md"
              placeholder="Enter latitude"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold">Longitude:</div>
            <input
              type="number"
              step="0.000001"
              value={venue.longitude || ""}
              onChange={(e) =>
                setVenue({ ...venue, longitude: Number(e.target.value) })
              }
              className="w-full p-2 border rounded-md"
              placeholder="Enter longitude"
            />
          </div>
        </div>

        {/* Area Size */}
        <div className="flex items-center gap-2">
          <div className="font-medium w-[30%]">Area Size:</div>
          <input
            type="number"
            value={venue.area_size || ""}
            onChange={(e) =>
              setVenue({ ...venue, area_size: Number(e.target.value) })
            }
            className="w-full p-2 border rounded-md"
            min={0}
            placeholder="Enter area size"
          />
          <p>sq.m</p>
        </div>

        {/* Number of Rooms */}
        <div className="flex items-center gap-2">
          <div className="font-medium w-[50%]">Number of Rooms:</div>
          <input
            type="number"
            value={venue.number_of_rooms || ""}
            onChange={(e) =>
              setVenue({ ...venue, number_of_rooms: Number(e.target.value) })
            }
            className="w-full p-2 border rounded-md"
            min={0}
            placeholder="Enter number of rooms"
          />
        </div>

        {/* Outdoor Spaces */}
        <div className="space-y-2">
          <div className="font-medium">Outdoor Spaces:</div>
          <input
            type="number"
            value={venue.outdoor_spaces || ""}
            onChange={(e) =>
              setVenue({ ...venue, outdoor_spaces: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            placeholder="Describe outdoor spaces available"
          />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="font-medium w-[15%]">Price :</div>
          <input
            type="number"
            value={venue.price}
            onChange={(e) =>
              setVenue({ ...venue, price: Number(e.target.value) })
            }
            className="w-full p-2 border rounded-md"
            min={0}
            required
          />
          <p>THB</p>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2">
          <div className="font-medium w-[25%]">Capacity :</div>
          <input
            type="number"
            value={venue.capacity}
            onChange={(e) =>
              setVenue({ ...venue, capacity: Number(e.target.value) })
            }
            className="w-full p-2 border rounded-md"
            min={0}
            required
          />
          <p>Persons</p>
        </div>

        {/* Parking Space */}
        <div className="flex items-center gap-2">
          <div className="font-medium w-[50%]">Parking Space (Car):</div>
          <input
            type="number"
            value={venue.parking_space}
            onChange={(e) =>
              setVenue({ ...venue, parking_space: Number(e.target.value) })
            }
            className="w-full p-2 border rounded-md"
            min={0}
            required
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-2">
          <div className="font-medium">Additional Information :</div>
          <textarea
            value={venue.additional_information}
            onChange={(e) =>
              setVenue({ ...venue, additional_information: e.target.value })
            }
            className="w-full p-2 border rounded-md min-h-[100px]"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
