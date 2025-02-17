"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/hook/api";
import { Venue } from "@/types/venue";
import { useUserId } from "@/hook/userid";
import { format } from "date-fns";

// Define a type for venue requests
interface VenueRequest {
  id: number;
  venue: number;
  venue_name: string;
  location: string;
  category_event: string;
  number_of_rooms: number;
  additional_information: string;
  status: number;
  venue_owner: number;
  created_at?: string;
}

const ShowVenueRequest = () => {
  const [venueRequests, setVenueRequests] = useState<VenueRequest[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const userId = useUserId();

  useEffect(() => {
    if (!userId) return;
    const fetchVenueRequests = async () => {
      try {
        const response = await apiJson.get("/venue-requests/");
        // Filter venue requests where the venue owner is the current user
        const filteredRequests = response.data.filter(
          (request: VenueRequest) => request.venue_owner === userId
        );
        setVenueRequests(filteredRequests);
      } catch (error) {
        console.error("Error fetching venue requests:", error);
      }
    };
    fetchVenueRequests();
  }, [userId]);

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="p-6 text-black">
      <h2 className="text-xl font-semibold mb-4">My Venue Requests</h2>
      <div className="p-6 bg-gray-100 rounded-lg">
        {venueRequests.length === 0 ? (
          <p className="text-center text-gray-500">
            You have no venue requests
          </p>
        ) : (
          venueRequests.map((venueRequest) => {
            const formattedDate = venueRequest.created_at
              ? format(
                  new Date(venueRequest.created_at),
                  "dd MMM yyyy"
                ).toUpperCase()
              : "Unknown Date";

            return (
              <div
                key={venueRequest.id}
                className="bg-white p-4 mb-4 rounded-lg shadow border border-[#3F6B96]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{venueRequest.venue_name}</p>
                    <p className="text-gray-500">{venueRequest.location}</p>
                    {venueRequest.created_at && (
                      <p className="text-gray-500">
                        Submitted on: {formattedDate}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {venueRequest.status === 3 ? (
                      <p className="text-green-600 font-semibold">Approved</p>
                    ) : venueRequest.status === 2 ? (
                      <p className="text-yellow-500 font-semibold">Pending</p>
                    ) : venueRequest.status === 1 ? (
                      <p className="text-red-600 font-semibold">Rejected</p>
                    ) : null}

                    <button
                      className="text-gray-600 underline"
                      onClick={() => toggleExpand(venueRequest.id)}
                    >
                      {expanded === venueRequest.id ? "Hide" : "Detail"}
                    </button>
                  </div>
                </div>

                {expanded === venueRequest.id && (
                  <div className="mt-4 p-3 border rounded bg-gray-50">
                    <p>
                      <strong>Venue Name:</strong> {venueRequest.venue_name}
                    </p>
                    <p>
                      <strong>Location:</strong> {venueRequest.location}
                    </p>
                    <p>
                      <strong>Category:</strong> {venueRequest.category_event}
                    </p>
                    <p>
                      <strong>Number of Rooms:</strong>{" "}
                      {venueRequest.number_of_rooms}
                    </p>
                    <p>
                      <strong>Additional Information:</strong>{" "}
                      {venueRequest.additional_information}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {venueRequest.status === 3
                        ? "Approved"
                        : venueRequest.status === 2
                        ? "Pending"
                        : venueRequest.status === 1
                        ? "Rejected"
                        : "Unknown"}
                    </p>
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

export default ShowVenueRequest;
