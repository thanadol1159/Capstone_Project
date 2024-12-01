"use client";
import { Venue } from "@/types/venue";

export default function VenueCard({
  id,
  venue_type,
  venue_name,
  image,
  location,
  category_event,
  price,
  area_size,
  capacity,
  number_of_rooms,
  parking_space,
  outdoor_spaces,
  additional_information,
  venue_certification,
  personal_identification,
  onDetailClick,
}: Venue) {
  const categoryColors: Record<string, string> = {
    Meeting: "bg-blue-100 text-blue-600",
    Studio: "bg-green-100 text-green-600",
    Party: "bg-purple-100 text-purple-600",
    Default: "bg-gray-200 text-gray-600",
  };

  const categoryKey = category_event || "Default";
  const categoryStyle =
    categoryColors[categoryKey] || categoryColors["Default"];

  const addNk1ToUrl = (url: string): string => {
    return url.replace(/(:8080)(\/images\/)/, "$1/nk1$2");
  };

  const modifiedImage = image ? addNk1ToUrl(image) : "/placeholder-image.jpg";

  return (
    <div className="bg-white rounded-lg shadow-sm border-[2.5px] border-[#000000]">
      <div className="p-4">
        <img
          src={modifiedImage}
          alt={venue_name}
          className="w-full h-36 object-cover rounded-t-lg"
        />
        <div className="flex justify-between items-center mb-2 py-2">
          <p className="text-black font-bold">{venue_name}</p>
        </div>

        <div className="flex items-center gap-2 text-black mb-4">
          <img src="/logo/location_icon.png" alt="Location Icon" />
          <span className="text-sm">{location}</span>

          {/* Category Badge */}
          {category_event && (
            <div
              className={`text-xs font-semibold px-3 py-1 rounded-lg ${categoryStyle}`}
            >
              {category_event}
            </div>
          )}
        </div>

        <button
          onClick={() => onDetailClick?.(id)}
          className="w-full py-2 bg-[#5E4444] text-white rounded"
        >
          Detail
        </button>
      </div>
    </div>
  );
}
