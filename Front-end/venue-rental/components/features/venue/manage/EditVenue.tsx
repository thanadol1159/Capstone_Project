"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Venue } from "@/types/venue";
import { apiFormData, apiJson } from "@/hook/api";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import {
  X,
  Upload,
  Info,
  MapPin,
  Home,
  Square,
  Car,
  Users,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function VenueEditPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [files, setFiles] = useState({
    images: [] as File[],
  });

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
        toast.error("Failed to load venue details");
      }
    };

    if (params.id) {
      fetchVenueDetail();
    }
  }, [params.id]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newImages = Array.from(selectedFiles);
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

  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

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

      existingImages.forEach((img) => {
        formData.append("venue_images_ids", String(img.id));
      });

      files.images.forEach((image) => {
        formData.append("venue_images", image);
      });

      await apiFormData.put(`/venues/${params.id}/`, formData);
      toast.success("Venue updated successfully!");
      router.push(`/nk1/venue/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating venue:", error);
      toast.error("Failed to update venue");
    } finally {
      setIsSubmitting(false);
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
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 text-[#3F6B96]">
      <h1 className="text-2xl font-bold mb-6">Edit Venue</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Venue Images
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload New Images
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 " />
                  <p className="mb-2 text-sm ">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs ">PNG, JPG, JPEG (max. 5MB each)</p>
                </div>
                <input
                  type="file"
                  name="images"
                  onChange={handleImagesChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium  mb-2">
                Existing Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.image}
                      alt="Venue"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <div>
              <label className="block text-sm font-medium  mb-2">
                New Uploads
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

        {/* Basic Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Venue Type */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Venue Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVenue({ ...venue, venue_type: 1 })}
                  className={`px-4 py-2 rounded-md border flex-1 flex items-center justify-center gap-2 ${
                    venue.venue_type === 1
                      ? "bg-[#3F6B96] text-white hover:[#335473] font-medium"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Large Venue
                </button>
                <button
                  type="button"
                  onClick={() => setVenue({ ...venue, venue_type: 2 })}
                  className={`px-4 py-2 rounded-md border flex-1 flex items-center justify-center gap-2 ${
                    venue.venue_type === 2
                      ? "bg-[#3F6B96] text-white hover:[#335473] font-medium"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <Square className="w-4 h-4" />
                  Room Space
                </button>
              </div>
            </div>

            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Venue Name
              </label>
              <input
                type="text"
                value={venue.venue_name}
                onChange={(e) =>
                  setVenue({ ...venue, venue_name: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                required
                placeholder="Enter venue name"
              />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={venue.latitude || ""}
                onChange={(e) =>
                  setVenue({ ...venue, latitude: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g. 13.756331"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={venue.longitude || ""}
                onChange={(e) =>
                  setVenue({ ...venue, longitude: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g. 100.501762"
              />
            </div>
          </div>
        </div>

        {/* Venue Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Venue Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Area Size */}
            <div>
              <label className="text-sm font-medium  mb-2 flex items-center gap-1">
                <Square className="w-4 h-4" />
                Area Size (sq.m)
              </label>
              <input
                type="number"
                value={venue.area_size || ""}
                onChange={(e) =>
                  setVenue({ ...venue, area_size: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                min={0}
                placeholder="Enter area size"
              />
            </div>

            {/* Number of Rooms */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Number of Rooms
              </label>
              <input
                type="number"
                value={venue.number_of_rooms || ""}
                onChange={(e) =>
                  setVenue({
                    ...venue,
                    number_of_rooms: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                min={0}
                placeholder="Enter number of rooms"
              />
            </div>

            {/* Outdoor Spaces */}
            <div>
              <label className="block text-sm font-medium  mb-2">
                Outdoor Spaces
              </label>
              <input
                type="number"
                value={venue.outdoor_spaces || ""}
                onChange={(e) =>
                  setVenue({ ...venue, outdoor_spaces: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Number of outdoor spaces"
              />
            </div>

            {/* Parking Space */}
            <div>
              <label className="text-sm font-medium  mb-2 flex items-center gap-1">
                <Car className="w-4 h-4" />
                Parking Space (Cars)
              </label>
              <input
                type="number"
                value={venue.parking_space}
                onChange={(e) =>
                  setVenue({ ...venue, parking_space: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                min={0}
                required
                placeholder="Enter parking spaces"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium  mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Capacity
              </label>
              <input
                type="number"
                value={venue.capacity}
                onChange={(e) =>
                  setVenue({ ...venue, capacity: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                min={0}
                required
                placeholder="Enter capacity"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium  mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Price (THB)
              </label>
              <input
                type="number"
                value={venue.price}
                onChange={(e) =>
                  setVenue({ ...venue, price: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                min={0}
                required
                placeholder="Enter price"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#3F6B96]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Additional Information
          </h2>
          <textarea
            value={venue.additional_information}
            onChange={(e) =>
              setVenue({ ...venue, additional_information: e.target.value })
            }
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent min-h-[120px]"
            required
            placeholder="Describe the venue, amenities, restrictions, etc."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-[#3F6B96] text-white rounded-md hover:bg-[#335473] transition font-medium ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
