"use client";
import { useEffect, useState } from "react";
import { Venue } from "@/types/venue";
import { Heart } from "lucide-react";
import { apiJson } from "@/hook/api";
import { useUserId } from "@/hook/userid";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import { MapPin } from "lucide-react";
import { Review } from "@/types/Review";
import { Star } from "lucide-react";

export default function VenueCard({
  id,
  venue_name,
  venue_images,
  location,
  category_event,
  onDetailClick,
  onRemoveFavorite,
}: Venue & { onRemoveFavorite?: () => void }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const userId = useUserId();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);

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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await apiJson.get(`/reviews/?venue=${id}`);
        setReviews(data);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (reviews.length > 0) {
      const avg =
        reviews.reduce((sum, review) => {
          return sum + calculateReviewScore(review);
        }, 0) / reviews.length;
      setAverageRating(avg);
    } else {
      setAverageRating(0);
    }
  }, [reviews]);

  const calculateReviewScore = (review: Review) => {
    return (
      (review.clean +
        review.service +
        review.value_for_money +
        review.matches_expectations +
        review.facilities +
        review.environment +
        review.location) /
      7
    );
  };

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
    <div className="bg-white rounded-lg shadow-sm border-[2.5px] border-[#3F6B96] overflow-hidden">
      <div className="relative">
        {/* Image with Star Rating Badge */}
        <div className="relative p-2">
          <img
            src={
              venue_images.length > 0
                ? venue_images[0].image
                : "/placeholder-image.jpg"
            }
            alt={venue_name}
            className="w-full h-36 object-cover rounded-t-lg"
          />

          {/* Star Rating Badge - Top Left */}
          {/* ส่วนที่ปรับแล้ว */}
          <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-md px-2 py-1 flex items-center shadow-sm text-xs">
            <Star
              className={`w-3 h-3 mr-1 ${
                reviews.length > 0
                  ? "text-[#335473] fill-[#335473]"
                  : "text-gray-400 fill-gray-100"
              }`}
            />
            <span
              className={`font-medium ${
                reviews.length > 0 ? "text-gray-800" : "text-gray-500"
              }`}
            >
              {reviews.length > 0 ? averageRating.toFixed(1) : "ยังไม่มีรีวิว"}
            </span>
          </div>

          {/* Favorite Heart - Top Right */}
          {accessToken && (
            <button
              onClick={toggleFavorite}
              className="absolute top-2 right-2 p-1 hover:scale-110 transition bg-white bg-opacity-70 rounded-full"
            >
              <Heart
                size={20}
                className={`transition ${
                  isFavorite
                    ? "text-[#335473] stroke-[#335473] fill-[#335473]"
                    : "text-gray-700 stroke-gray-700"
                }`}
              />
            </button>
          )}
        </div>

        {/* Venue Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900">{venue_name}</h3>
            {category_event && (
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-md ${categoryStyle}`}
              >
                {category_event}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-gray-700 mb-3">
            <MapPin size={16} className="text-gray-600" />
            <span className="text-sm">{location}</span>
          </div>

          <button
            onClick={() => onDetailClick?.(id)}
            className="w-full py-2 bg-[#3F6B96] hover:bg-[#335473] text-white rounded-lg transition-colors"
          >
            {reviews.length === 0 ? "Be first to reviews!" : "Views Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
