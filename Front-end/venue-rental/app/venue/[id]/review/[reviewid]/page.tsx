"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiJson } from "@/hook/api";
import { Star } from "lucide-react";
import { useUserId } from "@/hook/userid";

export default function ReviewCreate() {
  const params = useParams();
  const router = useRouter();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isEligible, setIsEligible] = useState(false);

  const userId = useUserId();
  const venueId = params.id;

  useEffect(() => {
    const checkBookingEligibility = async () => {
      try {
        const response = await apiJson.get(`/bookings/`);
        const bookings = response.data;
        console.log(userId);
        console.log(venueId);

        const userVenueBookings = bookings.filter(
          (booking: any) =>
            booking.user === userId && booking.venue === Number(venueId)
        );

        console.log(bookings);
        console.log(userVenueBookings);

        const validBooking = userVenueBookings.some(
          (booking: any) =>
            booking.status_booking === 3 &&
            new Date(booking.check_out) < new Date()
        );

        setIsEligible(validBooking);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    checkBookingEligibility();
  }, [userId, venueId]);

  const handleSubmitReview = async () => {
    if (!reviewText.trim() || rating === 0) {
      alert("Please provide a review and rating");
      return;
    }

    if (!isEligible) {
      alert(
        "You must have a completed booking for this venue before reviewing."
      );
      return;
    }

    try {
      await apiJson.post("/reviews/", {
        user: userId,
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
      {!isEligible ? (
        <p className="text-red-500 text-center">
          You must have a completed booking for this venue before reviewing.
        </p>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
