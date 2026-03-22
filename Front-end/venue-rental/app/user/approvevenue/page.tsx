"use client";

import { useEffect, useState, useRef } from "react";
import { apiJson } from "@/hook/api";
import { Booking } from "@/types/booking";
import { Venue } from "@/types/venue";
import { useUserId } from "@/hook/userid";
import { format } from "date-fns";
import gsap from "gsap";
import { ChevronDown, ChevronUp } from "lucide-react";

const ApproveBooking = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userNames, setUserNames] = useState<{ [key: number]: string }>({});
  const [venues, setVenues] = useState<Venue[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [closingDropdownId, setClosingDropdownId] = useState<number | null>(
    null
  );
  const detailRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const userId = useUserId();

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

  useEffect(() => {
    if (venues.length === 0) return;
    const fetchBookingsRequest = async () => {
      try {
        const response = await apiJson.get("/bookings/");
        const venueIds = new Set(venues.map((venue) => venue.id));
        const filteredBookings = response.data.filter((booking: Booking) =>
          venueIds.has(booking.venue)
        );
        setBookings(filteredBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookingsRequest();
  }, [venues]);

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

  useEffect(() => {
    if (openDropdownId && detailRefs.current[openDropdownId]) {
      gsap.fromTo(
        detailRefs.current[openDropdownId],
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [openDropdownId]);

  const toggleDropdown = (id: number) => {
    if (openDropdownId === id) {
      const el = detailRefs.current[id];
      if (el) {
        gsap.to(el, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setClosingDropdownId(null);
            setOpenDropdownId(null);
          },
        });
        setClosingDropdownId(id);
      } else {
        setOpenDropdownId(null);
      }
    } else {
      setOpenDropdownId(id);
    }
  };

  const statusText = (status: number) =>
    status === 1
      ? "Rejected"
      : status === 2
      ? "Pending"
      : status === 3
      ? "Approved"
      : "Unknown";

  const statusColor = (status: number) =>
    status === 1
      ? "text-[#F16161]"
      : status === 2
      ? "text-[#CBC420]"
      : status === 3
      ? "text-[#5AEE69]"
      : "text-gray-600";

  const sendNotification = async (userId: number) => {
    try {
      await apiJson.post("/notifications/", {
        notifications_type: "User approve",
        create_at: new Date().toISOString(),
        message: "Your Booking has got approved!",
        user: userId,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const sendNotificationRejected = async (userId: number) => {
    try {
      await apiJson.post("/notifications/", {
        notifications_type: "User Rejected",
        create_at: new Date().toISOString(),
        message: "Your Booking has got rejected!",
        user: userId,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const approveBooking = async (bookingId: number, venue_owner: number) => {
    try {
      await apiJson.patch(`/bookings/${bookingId}/`, { status_booking: 3 });
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status_booking: 3 } : booking
        )
      );
      sendNotification(venue_owner);
      toggleDropdown(bookingId);
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  const rejectBooking = async (bookingId: number, venue_owner: number) => {
    try {
      await apiJson.patch(`/bookings/${bookingId}/`, { status_booking: 1 });
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status_booking: 1 } : booking
        )
      );
      sendNotificationRejected(venue_owner);
      toggleDropdown(bookingId);
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  return (
    <div className="py-8 px-4 bg-[#F2F8FF] min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#304B84] mb-2">
          Approve Bookings
        </h1>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-[#AC978A] p-6 text-center">
            <p className="text-[#3F6B96]">You have no booking yet</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const venue = venues.find((v) => v.id === booking.venue);
            const formattedCheckIn = booking.check_in
              ? format(new Date(booking.check_in), "dd MMM yyyy").toUpperCase()
              : "Unknown Check-in Date";
            const formattedCheckOut = booking.check_out
              ? format(new Date(booking.check_out), "dd MMM yyyy").toUpperCase()
              : "Unknown Check-out Date";

            const isOpen = openDropdownId === booking.id;
            const isClosing = closingDropdownId === booking.id;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md border border-[#AC978A] overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-2">
                  <div>
                    <p className="text-lg font-bold text-[#000]">
                      {venue ? venue.venue_name : "Unknown Venue"}
                    </p>
                    <p className="text-sm text-[#304B84]">
                      {formattedCheckIn} - {formattedCheckOut}
                    </p>
                    <p className="text-sm text-[#304B84]">
                      Booked by: {userNames[booking.user] || "Loading..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${statusColor(
                        booking.status_booking
                      )}`}
                    >
                      {statusText(booking.status_booking)}
                    </span>
                    {booking.status_booking !== 1 &&
                      booking.status_booking !== 3 && (
                        <button
                          onClick={() => toggleDropdown(booking.id)}
                          className="text-[#304B84] font-semibold underline hover:text-[#492b26] text-sm"
                        >
                          {isOpen ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      )}
                  </div>
                </div>

                {(isOpen || isClosing) && (
                  <div
                    ref={(el) => {
                      detailRefs.current[booking.id] = el;
                    }}
                    className="bg-[#F9FCFF] px-6 py-4 border-t border-[#E0D4CB] overflow-hidden"
                  >
                    <div className="text-sm text-[#304B84] space-y-2">
                      <p>
                        <strong>Venue:</strong>{" "}
                        {venue ? venue.venue_name : "Unknown"}
                      </p>
                      <p>
                        <strong>User:</strong>{" "}
                        {userNames[booking.user] || "Loading..."}
                      </p>
                      <p>
                        <strong>Dates:</strong> {formattedCheckIn} to{" "}
                        {formattedCheckOut}
                      </p>
                      <p>
                        <strong>Total Price:</strong> {booking.total_price} THB
                      </p>
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          className="px-4 py-2 border border-[#3F6B96] rounded-lg text-[#3F6B96] font-medium hover:bg-[#3F6B96] hover:text-white transition-colors"
                          onClick={() =>
                            rejectBooking(booking.id, booking.user)
                          }
                        >
                          Deny
                        </button>
                        <button
                          className="px-4 py-2 bg-[#3F6B96] text-white rounded-lg font-medium hover:bg-[#304B84] transition-colors"
                          onClick={() =>
                            approveBooking(booking.id, booking.user)
                          }
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApproveBooking;
