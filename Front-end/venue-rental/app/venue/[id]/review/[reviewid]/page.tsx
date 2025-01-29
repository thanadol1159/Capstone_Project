"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import { apiJson } from "@/hook/api";
import { Star } from "lucide-react";
import { useAccountId } from "@/hook/userid";

export default function ReviewCreate() {
  const params = useParams();
  const router = useRouter();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const accountId = useAccountId();
  const venueId = params.id;

  const handleSubmitReview = async () => {
    if (!reviewText.trim() || rating === 0) {
      alert("Please provide a review and rating");
      return;
    }

    try {
      await apiJson.post("/reviews/", {
        account: accountId,
        venue: venueId,
        reviewDetail: reviewText,
        point: rating,
        createAt: new Date().toISOString(),
      });

      router.push(`/venue/${venueId}`);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  const StarRating = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={40}
            fill={(hoverRating || rating) >= star ? "gold" : "none"}
            color="gold"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="cursor-pointer"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-black">
      <h1 className="text-2xl font-bold mb-6 text-center">Write a Review</h1>

      <div className="mb-6">
        <label className="block text-lg mb-2">Your Rating:</label>
        <StarRating />
        <p className="text-gray-600 mt-2">
          {rating > 0 ? `${rating} out of 5 stars` : "Select your rating"}
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="review" className="block text-lg mb-2">
          Your Review:
        </label>
        <textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full p-3 border rounded-lg h-40"
          placeholder="Share your experience about this venue..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.push(`/venue/${venueId}`)}
          className="py-2 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitReview}
          className="py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
