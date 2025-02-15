"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Venue } from "@/types/venue";
import { Booking } from "@/types/booking";
import { VenueType } from "@/types/venueType";
import { apiJson } from "@/hook/api";
import { RootState } from "@/hook/store";
import Review from "@/components/ui/ReviewsBox";

const addNk1ToUrl = (url: string): string => {
  return url ? url.replace(/(\/images\/)/, "$1/nk1$2") : "";
};

export default function VenuePage() {
  const params = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [typeVenue, setTypeVenue] = useState<VenueType | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchVenueDetail = async () => {
      try {
        const { data } = await apiJson.get(`/venues/${params.id}/`);
        setVenue(data);
      } catch (error) {
        console.error("Error fetching venue:", error);
        setVenue(null);
      }
    };

    const fetchBookings = async () => {
      try {
        const { data } = await apiJson.get(`/bookings?venue=${params.id}`);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const venueId = params.id;
        const { data } = await apiJson.get(`/reviews`);

        const filteredReviews = data.filter(
          (review: { venue: number }) => review.venue === Number(venueId)
        );

        console.log("Filtered Reviews:", filteredReviews);
        setReviews(filteredReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };

    if (params.id) {
      fetchVenueDetail();
      fetchReviews();
      fetchBookings();
    }
  }, [params.id]);

  console.log(bookings);

  useEffect(() => {
    const fetchVenueType = async () => {
      if (venue?.venue_type) {
        try {
          const { data } = await apiJson.get(
            `/types-of-venue/${venue.venue_type}/`
          );
          setTypeVenue(data);
        } catch (error) {
          console.error("Error fetching venue type:", error);
        }
      }
    };

    fetchVenueType();
  }, [venue]);

  const handleCreateReview = () => {
    if (!accessToken) {
      setShowLoginModal(true);
      return;
    }
    router.push(`/nk1/venue/${params.id}/review/create`);
  };

  const handleBack = () => {
    router.push("/nk1");
  };

  const handleBooking = () => {
    if (!accessToken) {
      setShowLoginModal(true);
      return;
    }
    router.push(`/nk1/venue/${params.id}/booking/create`);
  };

  const handleLogin = () => {
    const returnUrl = `/venue/${params.id}`;
    router.push(`/nk1/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  if (!venue) {
    return <div>Venue not found</div>;
  }

  const imageUrl = venue.image ? venue.image : "/placeholder-image.jpg";
  const venueType = typeVenue?.type_name || "Unknown Type";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-black ">
      <h1 className="text-2xl font-semibold text-center mb-4 mt-2">
        {venue.venue_name}
      </h1>
      <div className="relative w-full aspect-[20/10]">
        <img
          src={imageUrl}
          alt={venue.venue_name}
          className="rounded-lg object-cover w-[80%] mx-auto"
        />
      </div>
      <div className="space-y-4 mt-6">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Venue Name:</span>
          <span>{venue.venue_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold">Price:</span>
          <span>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "THB",
            }).format(venue.price)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold">Capacity:</span>
          <span>{venue.capacity} people</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold">Parking Space:</span>
          <span>{venue.parking_space} spots</span>
        </div>
        {venue.additional_information && (
          <div>
            <span className="font-semibold">Additional Information:</span>
            <p className="text-gray-600">{venue.additional_information}</p>
          </div>
        )}
        <div className="flex items-center gap-4">
          <span className="font-semibold">Type:</span>
          <span>{venueType}</span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <div className="space-y-4">
          {reviews
            .sort(
              (a, b) =>
                new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
            )
            .map((review, index) => {
              const sortedBookings = bookings
                .filter(
                  (booking) =>
                    booking.user === review.user &&
                    booking.venue === review.venue
                )
                .sort(
                  (a, b) =>
                    new Date(a.check_in).getTime() -
                    new Date(b.check_in).getTime()
                );

              const userBooking = sortedBookings[index] || null;

              return (
                <Review
                  key={review.id}
                  date={review.createAt}
                  rating={review.point}
                  review={review.reviewDetail}
                  user={review.user}
                  checkIn={userBooking.check_in}
                  checkOut={userBooking.check_out}
                />
              );
            })}
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-10">
        <button
          type="button"
          onClick={handleBack}
          className="py-2 px-12 border border-black rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200"
        >
          Back
        </button>
        <button
          onClick={handleBooking}
          className="py-2 px-12 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-200"
        >
          {accessToken ? "Book Now" : "Login to Book"}
        </button>
        <button
          onClick={handleCreateReview}
          className="py-2 px-12 bg-white text-[#7A90A4] font-semibold rounded-lg border border-[#3F6B96]"
        >
          {accessToken ? "Write a Review" : "Login to Review"}
        </button>
      </div>

      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please login or create an account to book this venue.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
