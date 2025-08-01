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
import Reviews from "@/components/ui/ReviewsBox";
import { Review } from "@/types/Review";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import "swiper/css/navigation";
import MapComponent from "../../../components/common/Map";

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
        const { data } = await apiJson.get(`/bookings/venue=${params.id}/`);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const venueId = params.id;
        const { data } = await apiJson.get(`/reviews/`);

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
    router.push(`/nk1/venue/${params.id}/review/create/`);
  };

  const handleBack = () => {
    router.push("/nk1");
  };

  const handleBooking = () => {
    if (!accessToken) {
      setShowLoginModal(true);
      return;
    }
    router.push(`/nk1/venue/${params.id}/booking/create/`);
  };

  const handleLogin = () => {
    const returnUrl = `/venue/${params.id}`;
    router.push(`/nk1/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  if (!venue) {
    return <div className="p-4 text-center">Venue not found</div>;
  }

  const venueType = typeVenue?.type_name || "Unknown Type";
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-black">
      <h1 className="text-xl sm:text-2xl font-semibold text-center mb-4 mt-2">
        {venue.venue_name}
      </h1>

      {/* Image Gallery */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[30/10]">
        {venue.venue_images.length > 1 ? (
          <Swiper
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="w-full sm:w-[80%] mx-auto rounded-lg overflow-hidden custom-swiper"
          >
            {venue.venue_images.map((img) => (
              <SwiperSlide key={img.id}>
                <img
                  src={img.image}
                  alt={venue.venue_name}
                  className="rounded-lg object-contain w-full h-96"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img
            src={venue.venue_images[0]?.image || "/placeholder-image.jpg"}
            alt={venue.venue_name}
            className="rounded-lg object-cover w-full sm:w-[80%] mx-auto h-full"
          />
        )}
      </div>

      {/* Details Section */}
      <div className="mt-6 sm:mt-8 bg-[#E6F3FF] relative rounded-md p-2 sm:p-4">
        <div className="absolute top-0 left-0 bg-[#3F6B96] px-4 sm:px-6 py-1 sm:py-2 text-white rounded-tl-md rounded-br-md text-sm sm:text-base">
          <p className="font-semibold">Details</p>
        </div>

        <div className="pt-16 sm:pt-20 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-semibold sm:w-32">Venue Name:</span>
              <span>{venue.venue_name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-semibold sm:w-32">Price:</span>
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "THB",
                }).format(venue.price)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-semibold sm:w-32">Capacity:</span>
              <span>{venue.capacity} people</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-semibold sm:w-32">Parking Space:</span>
              <span>{venue.parking_space} spots</span>
            </div>

            {venue.additional_information && (
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                <span className="font-semibold sm:w-32">
                  Additional Information:
                </span>
                <p className="flex-1">{venue.additional_information}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-semibold sm:w-32">Type:</span>
              <span>{venueType}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="py-2 px-4 sm:px-12 border border-[#304B84] rounded-lg text-[#304B84] bg-white hover:bg-gray-200 transition duration-200"
          >
            Back
          </button>
          <button
            onClick={handleBooking}
            className="py-2 px-4 sm:px-12 bg-[#304B84] text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-200"
          >
            {accessToken ? "Book" : "Login to Book"}
          </button>
          <button
            onClick={handleCreateReview}
            className="py-2 px-4 sm:px-12 bg-white text-[#7A90A4] font-semibold rounded-lg border border-[#3F6B96]"
          >
            {accessToken ? "Write a Review" : "Login to Review"}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-6 sm:mt-8 bg-[#E6F3FF] relative rounded-md">
        <div className="absolute top-0 left-0 bg-[#3F6B96] px-4 sm:px-6 py-1 sm:py-2 text-white rounded-tl-md rounded-br-md text-sm sm:text-base">
          <p className="font-semibold">Reviews</p>
        </div>

        <div className="pt-16 sm:pt-20 px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Rating summary box */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Left side */}
              <div className="flex flex-col justify-center items-center">
                <div className="flex space-x-2 items-center">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {reviews.length > 0
                      ? (
                          reviews.reduce(
                            (sum, review) =>
                              sum +
                              (review.clean +
                                review.service +
                                review.value_for_money +
                                review.matches_expectations +
                                review.facilities +
                                review.environment +
                                review.location) /
                                7,
                            0
                          ) / reviews.length
                        ).toFixed(1)
                      : "0.0"}
                  </span>
                  <Star
                    className="w-6 h-6 sm:w-7 sm:h-7 text-[#335473]"
                    fill={"currentColor"}
                  />
                </div>
                <div>
                  <span className="text-gray-600 text-sm sm:text-base">
                    {reviews.length} ratings
                  </span>
                </div>
              </div>

              <div className="border border-[#C9D9EB] sm:block hidden"></div>

              {/* Right side */}
              <div className="space-y-2 right-side flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((review) => {
                    const avgRating =
                      (review.clean +
                        review.service +
                        review.value_for_money +
                        review.matches_expectations +
                        review.facilities +
                        review.environment +
                        review.location) /
                      7;
                    return Math.round(avgRating) === star;
                  }).length;

                  const percentage =
                    reviews.length === 0 ? 0 : (count / reviews.length) * 100;
                  return (
                    <div key={star} className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(star)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 sm:w-4 sm:h-4 text-[#335473]"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-[#335473] h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-6 sm:w-10 text-gray-600 text-right text-xs sm:text-base">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews
                .sort(
                  (a, b) =>
                    new Date(b.createAt).getTime() -
                    new Date(a.createAt).getTime()
                )
                .map((review) => {
                  const booking = bookings.find(
                    (booking) => booking.id === review.booking
                  );

                  return (
                    <Reviews
                      key={review.id}
                      date={review.createAt}
                      rating={review.point}
                      review={review.reviewDetail}
                      user={review.user}
                      checkIn={booking?.check_in || "N/A"}
                      checkOut={booking?.check_out || "N/A"}
                      reviewImages={review.review_images.map(
                        (img) => img.image
                      )}
                      clean={review.clean}
                      service={review.service}
                      valueForMoney={review.value_for_money}
                      matchesExpectations={review.matches_expectations}
                      facilities={review.facilities}
                      environment={review.environment}
                      location={review.location}
                    />
                  );
                })
            ) : (
              <div className="text-center text-[#7397BB] py-4 text-sm sm:text-base">
                -- No reviews yet. Be the first to write one! --
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Section */}
      {venue.latitude && venue.longitude ? (
        <div className="mt-6 sm:mt-8 h-64 sm:h-96 w-full">
          <MapComponent latitude={venue.latitude} longitude={venue.longitude} />
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6 sm:mt-8">
          No location data available
        </p>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Login Required
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Please login or create an account to book this venue.
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm sm:text-base"
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
