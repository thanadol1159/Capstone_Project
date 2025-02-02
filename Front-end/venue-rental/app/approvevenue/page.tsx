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

  const approveVenue = async (id: number) => {
    try {
      await apiJson.put(`/venues/${id}`, { status: 3 });
      setVenues((prevVenues) =>
        prevVenues.map((venue) =>
          venue.id === id ? { ...venue, status: 3 } : venue
        )
      );
    } catch (error) {
      console.error("Error approving venue:", error);
    }
  };

  return (
    <div className="p-6 text-black">
      <h2 className="text-xl font-semibold mb-4">Approve Venue</h2>
      <div className="p-6 bg-gray-100 rounded-lg">
        {venues.map((venue) => (
          <div key={venue.id} className="bg-white p-4 mb-4 rounded-lg shadow border border-[#3F6B96]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="font-medium">{venue.venue_name}</p>
                <p className="text-gray-500">{venue.location}</p>
              </div>
              <button
                className="text-gray-600 underline"
                onClick={() => toggleExpand(venue.id)}
              >
                {expanded === venue.id ? "Hide" : "Detail"}
              </button>
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
                  <button className="px-4 py-2 border rounded text-gray-700 mr-2 border-[#3F6B96]">
                    Deny
                  </button>
                  <button
                    className="px-4 py-2 bg-[#3F6B96] text-white rounded"
                    onClick={() => approveVenue(venue.id)}
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
