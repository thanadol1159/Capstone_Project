"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFormData } from "@/hook/api";
import { Star } from "lucide-react";
import { useUserId } from "@/hook/userid";
import { Booking } from "@/types/booking";
import toast from "react-hot-toast";

export default function ReviewCreate() {
  const params = useParams();
  const router = useRouter();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState({
    clean: 0,
    service: 0,
    value_for_money: 0,
    facilities: 0,
    matches_expectations: 0,
    environment: 0,
    location: 0,
  });
  const [hoverRating, setHoverRating] = useState(null);
  const [remainingReviews, setRemainingReviews] = useState(0);
  const [hasBooking, setHasBooking] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [images, setImages] = useState<FileList | null>(null);

  const userId = useUserId();
  const venueId = params.id;

  useEffect(() => {
    const fetchReviewEligibility = async () => {
      try {
        const [bookingsResponse, reviewsResponse] = await Promise.all([
          apiFormData.get(`/bookings/`),
          apiFormData.get(`/reviews/`),
        ]);

        const bookings = bookingsResponse.data;
        const reviews = reviewsResponse.data;

        const userVenueBookings = bookings.filter(
          (booking: Booking) =>
            booking.user === userId &&
            booking.venue === Number(venueId) &&
            booking.status_booking === 3 &&
            new Date(booking.check_out) < new Date() &&
            !booking.isReview
        );

        setBookings(userVenueBookings);
        setHasBooking(userVenueBookings.length > 0);
        setRemainingReviews(userVenueBookings.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchReviewEligibility();
  }, [userId, venueId]);

  const handleRating = (category: keyof typeof rating, value: number) => {
    setRating((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim() || !selectedBookingId) {
      toast.error("Please provide a review, rating, and select a booking.");
      return;
    }

    const formData = new FormData();
    formData.append("user", String(userId));
    formData.append("venue", String(venueId));
    formData.append("booking", String(selectedBookingId));
    formData.append("reviewDetail", reviewText);
    formData.append("createAt", new Date().toISOString());

    Object.entries(rating).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    if (images) {
      Array.from(images).forEach((image) => {
        formData.append("review_images", image);
      });
    }

    try {
      await apiFormData.post("/reviews/", formData);
      await apiFormData.patch(`/bookings/${selectedBookingId}/`, {
        isReview: true,
      });

      setRemainingReviews((prev) => prev - 1);
      setReviewText("");
      setRating({
        clean: 0,
        service: 0,
        value_for_money: 0,
        facilities: 0,
        matches_expectations: 0,
        environment: 0,
        location: 0,
      });
      setSelectedBookingId(null);
      setImages(null);

      router.push("/nk1");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-black">
      <h1 className="text-2xl font-bold mb-6 text-center">Write a Review</h1>
      {!hasBooking ? (
        <p className="text-red-500 text-center">
          Please book this venue first before submitting a review.
        </p>
      ) : (
        <>
          <p className="text-green-500 text-center mb-4">
            You can submit {remainingReviews} more review(s) for this venue.
          </p>
          <div className="mb-6">
            <label className="block text-lg mb-2">Select Booking:</label>
            <select
              value={selectedBookingId || ""}
              onChange={(e) => setSelectedBookingId(Number(e.target.value))}
              className="w-full p-3 border rounded-lg"
            >
              <option value="" disabled>
                Choose a booking
              </option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  Booking ID: {booking.id} (Check-in:{" "}
                  {new Date(booking.check_in).toLocaleDateString()}, Check-out:{" "}
                  {new Date(booking.check_out).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-lg mb-2">Your Ratings:</label>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(rating) as Array<keyof typeof rating>).map(
                (category) => (
                  <div key={category} className="flex flex-col items-center">
                    <p className="capitalize font-medium">
                      {category.replace(/_/g, " ")}
                    </p>
                    <div className="flex space-x-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={30}
                          fill={rating[category] >= star ? "gold" : "none"}
                          color="gold"
                          onClick={() => handleRating(category, star)}
                          className="cursor-pointer transition-transform transform hover:scale-110"
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
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
          <div className="mb-6">
            <label className="block text-lg mb-2">Upload Images:</label>
            <input
              type="file"
              multiple
              onChange={(e) => setImages(e.target.files)}
            />
          </div>
          <button
            onClick={handleSubmitReview}
            className="py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}
