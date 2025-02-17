"use client";
import { useEffect, useState } from "react";
import { Venue } from "@/types/venue";
import { Heart } from "lucide-react";
import { apiJson } from "@/hook/api";
import { useUserId } from "@/hook/userid";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import { MapPin } from "lucide-react";

export default function VenueCard({
  id,
  venue_name,
  image,
  location,
  category_event,
  onDetailClick,
  onRemoveFavorite,
}: Venue & { onRemoveFavorite?: () => void }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const userId = useUserId();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!userId || !accessToken) return;

    const fetchFavoriteStatus = async () => {
      try {
        const response = await apiJson.get("/favorites/");
        const isFavorited = response.data.some(
          (fav: any) => fav.venue === id && fav.user === userId
        );
        setIsFavorite(isFavorited);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavoriteStatus();
  }, [userId, id, accessToken]);

  const toggleFavorite = async () => {
    if (!userId || !accessToken)
      return alert("Please log in to favorite venues.");

    const previousFavoriteState = isFavorite;
    setIsFavorite(!previousFavoriteState);

    try {
      if (previousFavoriteState) {
        await apiJson.delete(`/favorites/${id}/`);
        onRemoveFavorite?.();
      } else {
        await apiJson.post("/favorites/", { venue_id: id, user_id: userId });
      }

      const response = await apiJson.get("/favorites/");
      const isFavorited = response.data.some(
        (fav: any) => fav.venue === id && fav.user === userId
      );
      setIsFavorite(isFavorited);
    } catch (error) {
      console.error("Error updating favorite:", error);
      setIsFavorite(previousFavoriteState);
    }
  };

  const categoryColors: Record<string, string> = {
    Meeting: "bg-[#E5D59B] text-[#5E4444] bg-opacity-70",
    Studio: "bg-[#AADEE5] text-[#5E4444] bg-opacity-70",
    Party: "bg-[#E59BB1] text-[#5E4444] bg-opacity-50",
    Default: "bg-gray-200 text-gray-600",
  };

  const categoryStyle = categoryColors[category_event || "Default"];

  return (
    <div className="bg-white rounded-lg shadow-sm border-[2.5px] border-[#3F6B96]">
      <div className="p-4 relative">
        <div className="relative">
          <img
            src={image || "/placeholder-image.jpg"}
            alt={venue_name}
            className="w-full h-36 object-cover rounded-t-lg"
          />

          {/* Show heart icon only if logged in */}
          {accessToken && (
            <button
              onClick={toggleFavorite}
              className="absolute top-0 right-0 p-1 hover:scale-110 transition"
            >
              <Heart
                size={24}
                className={`transition ${
                  isFavorite
                    ? "text-[#335473] stroke-[#335473] fill-[#335473]"
                    : "text-black stroke-black"
                }`}
              />
            </button>
          )}
        </div>

        <div className="flex items-center py-2 mt-2 gap-2 ">
          <p className="text-black font-bold">{venue_name}</p>
          {category_event && (
            <div
              className={`text-xs font-semibold px-3 py-1 rounded-md ${categoryStyle} opacity-70`}
            >
              {category_event}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-black mb-4">
          <MapPin size={20} color="#000000" strokeWidth={1} />
          <span className="text-sm my-auto">{location}</span>
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
