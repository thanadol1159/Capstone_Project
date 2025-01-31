"use client";
import React, { useState, useEffect } from "react";
import { apiJson } from "@/hook/api";
import { Venue } from "@/types/venue";
import { Booking } from "@/types/booking";
import { format } from "date-fns";

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBookingAndVenues = async () => {
      try {
        const [bookingsResponse, venuesResponse] = await Promise.all([
          apiJson.get("/bookings/"),
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

  const toggleDropdown = (id: number) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="py-5 bg-[#f8f3ef] min-h-screen">
      <div className="max-w-5xl mx-auto space-y-4">
        <table className="w-full bg-[#f8f3ef] rounded-lg overflow-hidden shadow border-separate border-spacing-y-4 p-4">
          <thead>
            <tr className="text-left text-[#492b26] font-bold border-b border-[#c6a89e]">
              <th className="py-4 px-6">PLACE NAMESSSS</th>
              <th className="py-4 px-6">DATE</th>
              <th className="py-4 px-6 text-center">STATUS</th>
              <th className="py-4 px-6 text-center">Detail</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const venue = venues.find((v) => v.id === booking.venue);
              const formattedDate = booking.check_in
                ? format(
                    new Date(booking.check_in),
                    "dd MMM yyyy"
                  ).toUpperCase()
                : "Unknown Date";

              const statusColor =
                booking.status_booking === null
                  ? "text-yellow-600"
                  : booking.status_booking === "approve"
                  ? "text-green-600"
                  : "text-red-600";

              return (
                <React.Fragment key={booking.id}>
                  <tr className="border border-[#AC978A] bg-white">
                    <td className="py-4 px-6 text-[#7e5046] font-bold">
                      {venue ? venue.venue_name : "Unknown"}
                    </td>
                    <td className="py-4 px-6 text-[#7e5046]">
                      {formattedDate}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`font-medium ${statusColor}`}>
                        {booking.status_booking === null
                          ? "In process"
                          : booking.status_booking === "approve"
                          ? "Approve"
                          : "Rejected"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => toggleDropdown(booking.id)}
                        className="text-[#7e5046] font-bold underline hover:text-[#492b26]"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                  {openDropdownId === booking.id && (
                    <tr className="bg-[#f9f6f4] border border-[#AC978A]">
                      <td colSpan={4} className="p-4">
                        <div className="text-[#7e5046]">
                          <p>
                            <strong>Booking ID:</strong> {booking.id}
                          </p>
                          <p>
                            <strong>Status:</strong>{" "}
                            {booking.status_booking === null
                              ? "In process"
                              : booking.status_booking === "approve"
                              ? "Approve"
                              : "Disapprove"}
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
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;
