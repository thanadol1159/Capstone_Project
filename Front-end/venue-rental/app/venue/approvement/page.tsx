"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/hook/api";
import { Booking } from "@/types/booking";
import { Venue } from "@/types/venue";
import { useUserId } from "@/hook/userid";
import { format } from "date-fns";

const ShowVenueRequest = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userNames, setUserNames] = useState<{ [key: number]: string }>({});
  const [venues, setVenues] = useState<Venue[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const userId = useUserId();

  // Fetch venues owned by the logged-in user
  useEffect(() => {
    if (!userId) return;
    const fetchVenues = async () => {
      try {
        const response = await apiJson.get("/venues/");
        const ownedVenues = response.data.filter(
          (venue: Venue) => venue.venue_owner === userId
        );
        setVenues(ownedVenues);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };
    fetchVenues();
  }, [userId]);

  // Fetch bookings only for the owned venues
  useEffect(() => {
    if (venues.length === 0) return;
    const fetchBookingsRequest = async () => {
      try {
        const venueIds = venues.map((venue) => venue.id); // Get all owned venue IDs
        const response = await apiJson.get("/bookings/");
        const filteredBookings = response.data.filter(
          (booking: Booking) => venueIds.includes(booking.venue) // Only get bookings for owned venues
        );
        setBookings(filteredBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookingsRequest();
  }, [venues]);

  // Fetch user names related to the bookings
  useEffect(() => {
    if (bookings.length === 0) return;
    const fetchUserNames = async () => {
      const userPromises = bookings.map(async (booking) => {
        try {
          const response = await apiJson.get(`/users/${booking.user}/`);
          return {
            userId: booking.user,
            userName: response.data.full_name || response.data.username,
          };
        } catch (error) {
          console.error(`Error fetching user ${booking.user}:`, error);
          return {
            userId: booking.user,
            userName: "Unknown",
          };
        }
      });
      const userResults = await Promise.all(userPromises);
      const userMap = userResults.reduce((acc: any, result) => {
        acc[result.userId] = result.userName;
        return acc;
      }, {});
      setUserNames(userMap);
    };
    fetchUserNames();
  }, [bookings]);

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="p-6 text-black">
      <h2 className="text-xl font-semibold mb-4">Venue Requests</h2>
      <div className="p-6 bg-gray-100 rounded-lg">
        {bookings.map((booking) => {
          const formattedCheckIn = booking.check_in
            ? format(new Date(booking.check_in), "dd MMM yyyy").toUpperCase()
            : "Unknown Check-in Date";
          const formattedCheckOut = booking.check_out
            ? format(new Date(booking.check_out), "dd MMM yyyy").toUpperCase()
            : "Unknown Check-out Date";
          const venue = venues.find((venue) => venue.id === booking.venue);
          const venueName = venue ? venue.venue_name : "Unknown Venue";

          return (
            <div
              key={booking.id}
              className="bg-white p-4 mb-4 rounded-lg shadow border border-[#3F6B96]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{venueName}</p>
                  <p className="text-gray-500">
                    Booked by: {userNames[booking.user] || "Loading..."}
                  </p>
                  <p className="text-gray-500">
                    Check-in: {formattedCheckIn} | Check-out:{" "}
                    {formattedCheckOut}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {booking.status_booking === 3 ? (
                    <p className="text-green-600 font-semibold">Approved</p>
                  ) : booking.status_booking === 2 ? (
                    <p className="text-yellow-500 font-semibold">Pending</p>
                  ) : booking.status_booking === 1 ? (
                    <p className="text-red-600 font-semibold">Rejected</p>
                  ) : null}

                  <button
                    className="text-gray-600 underline"
                    onClick={() => toggleExpand(booking.id)}
                  >
                    {expanded === booking.id ? "Hide" : "Detail"}
                  </button>
                </div>
              </div>

              {expanded === booking.id && (
                <div className="mt-4 p-3 border rounded bg-gray-50">
                  <p>
                    <strong>Venue:</strong> {venueName}
                  </p>
                  <p>
                    <strong>User:</strong>{" "}
                    {userNames[booking.user] || "Loading..."}
                  </p>
                  <p>
                    <strong>Date:</strong> Check-in: {formattedCheckIn} |
                    Check-out: {formattedCheckOut}
                  </p>
                  <p>
                    <strong>Total Price:</strong> {booking.total_price}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShowVenueRequest;
