"use client";
import { useEffect, useState } from "react";
import { Venue } from "@/types/venue";

export default function VenueCard({
  id,
  venue_name,
  image,
  location,
  category_event,
  onDetailClick,
}: Venue) {
  // const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // useEffect(() => {
  //   async function fetchImageBlob() {
  //     if (!image) return;
  //     try {
  //       const response = await fetch(image); 
  //       const blob = await response.blob(); 
  //       const url = URL.createObjectURL(blob);
  //       setBlobUrl(url);
  //     } catch (error) {
  //       console.error("Error loading image:", error);
  //     }
  //   }

  //   fetchImageBlob();
  //   return () => {
  //     if (blobUrl) URL.revokeObjectURL(blobUrl); 
  //   };
  // }, [image]);

  const categoryColors: Record<string, string> = {
    Meeting: "bg-[#E5D59B] text-[#5E4444] bg-opacity-70",
    Studio: "bg-[#AADEE5] text-[#5E4444] bg-opacity-70",
    Party: "bg-[#E59BB1] text-[#5E4444] bg-opacity-50",
    Default: "bg-gray-200 text-gray-600",
  };

  const categoryStyle = categoryColors[category_event || "Default"];

  return (
    <div className="bg-white rounded-lg shadow-sm border-[2.5px] border-[#3F6B96]">
      <div className="p-4">
        <img
          src={image || "/placeholder-image.jpg"} 
          alt={venue_name}
          className="w-full h-36 object-cover rounded-t-lg"
        />
        <div className="flex items-center py-2 mt-2 gap-2 ">
          <p className="text-black font-bold">{venue_name}</p>
          {category_event && (
            <div className={`text-xs font-semibold px-3 py-1 rounded-md ${categoryStyle} opacity-70`}>
              {category_event}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-black mb-4">
          <img src="/logo/location_icon.png" alt="Location Icon" />
          <span className="text-sm">{location}</span>
        </div>

        <button
          onClick={() => onDetailClick?.(id)}
          className="w-full py-2 bg-[#3F6B96] text-white rounded"
        >
          Detail
        </button>
      </div>
    </div>
  );
}
