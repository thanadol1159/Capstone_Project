"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/hook/api";
import { VenueRequest } from "@/types/venuerequest";

const ApproveVenue = () => {
  const [venues, setVenues] = useState<VenueRequest[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const fetchVenuesRequest = async () => {
      try {
        const response = await apiJson.get("/venue-requests/");
        setVenues(response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };

    fetchVenuesRequest();
  }, []);

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  const approveVenue = async (venueId: number, requestId: number) => {
    try {
      await apiJson.put(`/venues/${venueId}/`, { status: 3 });

      await apiJson.put(`/venue-requests/${requestId}/`, { status: 3 });

      // Update state correctly
      setVenues((prevVenues) =>
        prevVenues.map((venue) =>
          venue.id === requestId ? { ...venue, status: 3 } : venue
        )
      );
    } catch (error) {
      console.error("Error approving venue:", error);
    }
  };

  const rejectVenue = async (venueId: number, requestId: number) => {
    try {
      await apiJson.put(`/venues/${venueId}/`, { status: 1 });
      await apiJson.put(`/venue-requests/${requestId}/`, { status: 1 });

      setVenues((prevVenues) =>
        prevVenues.map((venue) =>
          venue.id === requestId ? { ...venue, status: 3 } : venue
        )
      );
    } catch (error) {
      console.error("Error rejecting venue:", error);
    }
  };

  return (
    <div className="p-6 text-black">
      <h2 className="text-xl font-semibold mb-4">Approve Venue</h2>
      <div className="p-6 bg-gray-100 rounded-lg">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white p-4 mb-4 rounded-lg shadow border border-[#3F6B96]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{venue.venue_name}</p>
                <p className="text-gray-500">{venue.location}</p>
              </div>
              <div className="flex items-center gap-3">
                {venue.status === 3 ? (
                  <p className="text-green-600 font-semibold">Approved</p>
                ) : venue.status === 2 ? (
                  <p className="text-yellow-500 font-semibold">Pending</p>
                ) : venue.status === 1 ? (
                  <p className="text-red-600 font-semibold">Rejected</p>
                ) : null}

                {venue.status !== 1 && venue.status !== 3 && (
                  <button
                    className="text-gray-600 underline"
                    onClick={() => toggleExpand(venue.id)}
                  >
                    {expanded === venue.id ? "Hide" : "Detail"}
                  </button>
                )}
              </div>
            </div>

            {expanded === venue.id && (
              <div className="mt-4 p-3 border rounded bg-gray-50">
                <p>
                  <strong>Category:</strong> {venue.category_event}
                </p>
                <p>
                  <strong>Rooms:</strong> {venue.number_of_rooms}
                </p>
                <p>
                  <strong>Info:</strong> {venue.additional_information}
                </p>
                <div className="flex justify-end mt-3">
                  <button
                    className="px-4 py-2 border rounded text-gray-700 mr-2 border-[#3F6B96]"
                    onClick={() => rejectVenue(venue.venue, venue.id)}
                  >
                    Deny
                  </button>
                  <button
                    className="px-4 py-2 bg-[#3F6B96] text-white rounded"
                    onClick={() => approveVenue(venue.venue, venue.id)}
                  >
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApproveVenue;
