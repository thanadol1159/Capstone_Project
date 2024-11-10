"use client";
import { VenueCardProps } from "@/types/venue";

export default function VenueCard({
  id,
  venue_type,
  venue_name,
  image,
  location,
  category,
  price,
  area_size,
  capacity,
  number_of_rooms,
  parking_space,
  outdoor_spaces,
  additional_information,
  venue_certification,
  personal_identification,
  type_of_venue,
  onDetailClick,
}: VenueCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border-[2.5px] border-[#000000]">
      <div className="p-4 ">
        <img src={image} alt={venue_name} className="w-full h-36 object-cover " />
        <div className="flex justify-between items-center mb-2 py-2">
          <p className="text-black font-bold ">{venue_name}</p>
          {/* <div className="flex gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded bg-pink-100 text-pink-600"
              >
                {tag}
              </span>
            ))}
          </div> */}
        </div>

        <div className="flex items-center gap-1 text-gray-600 mb-4">
          <img src="/logo/location_icon.png" alt="" />
          <span className="text-sm">{location}</span>
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
