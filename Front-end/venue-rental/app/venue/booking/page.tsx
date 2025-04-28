"use client";
import React, { useState, useEffect, useRef } from "react";
import { apiJson } from "@/hook/api";
import { Venue } from "@/types/venue";
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import gsap from "gsap";

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [closingDropdownId, setClosingDropdownId] = useState<number | null>(
    null
  );
  const detailRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchBookingAndVenues = async () => {
      try {
        const [bookingsResponse, venuesResponse] = await Promise.all([
          apiJson.get("bookings/my_bookings/"),
          apiJson.get("/venues/"),
        ]);
        setBookings(bookingsResponse.data);
        setVenues(venuesResponse.data);
      } catch (error) {
        console.error("Error fetching bookings and venues:", error);
      }
    };

    fetchBookingAndVenues();
  }, []);

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

  return (
    <div className="py-8 px-4 bg-[#F2F8FF] min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#304B84] mb-2">My Bookings</h1>
        {bookings.map((booking) => {
          const venue = venues.find((v) => v.id === booking.venue);
          const formattedDate = booking.check_in
            ? format(new Date(booking.check_in), "dd MMM yyyy").toUpperCase()
            : "Unknown Date";

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
                  <p className="text-sm text-[#304B84]">{formattedDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${statusColor(
                      booking.status_booking
                    )}`}
                  >
                    {statusText(booking.status_booking)}
                  </span>
                  <button
                    onClick={() => toggleDropdown(booking.id)}
                    className="text-[#304B84] font-semibold underline hover:text-[#492b26] text-sm"
                  >
                    {isOpen ? "Hide" : "Detail"}
                  </button>
                </div>
              </div>

              {/* Always render detail block if open or closing for animation */}
              {(isOpen || isClosing) && (
                <div
                  ref={(el) => {
                    detailRefs.current[booking.id] = el;
                  }}
                  className="bg-[#F9FCFF] px-6 py-4 border-t border-[#E0D4CB] overflow-hidden"
                >
                  <div className="text-sm text-[#304B84] space-y-2">
                    <p>
                      <strong>Booking ID:</strong> {booking.id}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={statusColor(booking.status_booking)}>
                        {statusText(booking.status_booking)}
                      </span>
                    </p>
                    <p>
                      <strong>Venue Name:</strong>{" "}
                      {venue ? venue.venue_name : "Unknown"}
                    </p>
                    <p>
                      <strong>Date:</strong> {formattedDate}
                    </p>
                    <p>
                      <strong>Price:</strong> {booking.total_price} THB
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingsPage;
