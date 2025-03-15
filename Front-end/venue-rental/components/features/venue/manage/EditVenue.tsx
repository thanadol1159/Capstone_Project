"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// import { VenueCardProps } from "@/types/venue";
import { Venue } from "@/types/venue";
import { apiFormData } from "@/hook/api";
import { apiJson } from "@/hook/api";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";

export default function VenueEditPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [files, setFiles] = useState({
    image: null as File | null,
    venue_certification: null as File | null,
    personal_identification: null as File | null,
  });

  useEffect(() => {
    const fetchVenueDetail = async () => {
      try {
        const { data } = await apiJson.get(`/venues/${params.id}/`);
        setVenue(data);
      } catch (error) {
        console.error("Error fetching venue:", error);
      }
    };

    if (params.id) {
      fetchVenueDetail();
    }
  }, [params.id]);

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
    if (!venue) return;

    try {
      const formData = new FormData();

      // Append venue data as JSON string
      Object.keys(venue).forEach((key) => {
        if (key !== "image") {
          formData.append(key, String(venue[key as keyof Venue]));
        }
      });

      // Append new image file if it exists
      if (files.image) {
        formData.append("image", files.image);
      }

      // Append other files if they exist
      if (files.venue_certification) {
        formData.append("venue_certification", files.venue_certification);
      }
      if (files.personal_identification) {
        formData.append(
          "personal_identification",
          files.personal_identification
        );
      }

      await apiFormData.put(`/venues/${params.id}/`, formData);

      router.push(`/nk1/venue/${params.id}`);
      // router.push(`/venue/manage`);
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
  });

  if (!venue) {
    return <div>Loading...</div>;
  }

  // const addNk1ToUrl = (url: string): string => {
  //   return url.replace(/(\/images\/)/, "$1/nk1$2");
  // };

  return (
    <div className="w-full max-w-lg mx-auto p-2 text-black">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview Image */}
        <div className="overflow-hidden mt-6">
          <div className="p-0">
            <img
              src={
                venue.venue_images && venue.venue_images.length > 0
                  ? venue.venue_images[0].image_url
                  : "/placeholder-image.jpg"
              }
              alt="Venue Preview"
              className="w-full h-48 object-scale-down"
            />
          </div>
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

        {/* Image */}
        <div className="flex items-center">
          <span className="w-16 font-medium">Image :</span>
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
