"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Venue } from "@/types/venue";
import { apiJson } from "@/hook/api";
import { RootState } from "@/hook/store";

export default function VenuePage() {
  const params = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchVenueDetail = async () => {
      try {
        const { data } = await apiJson.get(`/venues/${params.id}`);
        setVenue(data);
      } catch (error) {
        console.error("Error fetching venue:", error);
        setVenue(null);
      }
    };

    if (params.id) {
      fetchVenueDetail();
    }
  }, [params.id]);

  const handleBack = () => {
    router.push("/venue-rental");
  };

  const handleBooking = () => {
    if (!accessToken) {
      setShowLoginModal(true);
      return;
    }
    router.push(`/venue/${params.id}/booking/create`);
  };

  const handleLogin = () => {
    const returnUrl = `/venue/${params.id}`;
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  if (!venue) {
    return <div>Venue not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-black">
      <h1 className="text-2xl font-semibold text-center">{venue.venue_name}</h1>
      <div className="relative w-full aspect-[20/10]">
        <img
          src={venue.image}
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
              currency: "USD",
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
          <span>{venue.venue_type}</span>
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
