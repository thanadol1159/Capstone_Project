"use client";
import { useEffect, useState, useRef } from "react";
import { apiJson } from "@/hook/api";
import { VenueRequest } from "@/types/venuerequest";
import { useUserId } from "@/hook/userid";
import gsap from "gsap";

const ShowVenueRequest = () => {
  const [venueRequests, setVenueRequests] = useState<VenueRequest[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [closingDropdownId, setClosingDropdownId] = useState<number | null>(
    null
  );
  const detailRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const userId = useUserId();

  useEffect(() => {
    if (!userId) return;
    const fetchVenueRequests = async () => {
      try {
        const response = await apiJson.get("/venue-requests/");
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
        <h1 className="text-2xl font-bold text-[#304B84] mb-2">
          My Venue Requests
        </h1>

        {venueRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-[#AC978A] p-6 text-center">
            <p className="text-gray-500">You have no venue requests</p>
          </div>
        ) : (
          venueRequests.map((venueRequest) => {
            const isOpen = openDropdownId === venueRequest.id;
            const isClosing = closingDropdownId === venueRequest.id;

            return (
              <div
                key={venueRequest.id}
                className="bg-white rounded-xl shadow-md border border-[#AC978A] overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-2">
                  <div>
                    <p className="text-lg font-bold text-[#000]">
                      {venueRequest.venue_name}
                    </p>
                    <p className="text-sm text-[#304B84]">
                      {venueRequest.location}
                    </p>
                    <p className="text-sm text-[#304B84]">
                      Category: {venueRequest.category_event}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${statusColor(
                        venueRequest.status
                      )}`}
                    >
                      {statusText(venueRequest.status)}
                    </span>
                    <button
                      onClick={() => toggleDropdown(venueRequest.id)}
                      className="text-[#304B84] font-semibold underline hover:text-[#492b26] text-sm"
                    >
                      {isOpen ? "Hide" : "Details"}
                    </button>
                  </div>
                </div>

                {(isOpen || isClosing) && (
                  <div
                    ref={(el) => {
                      detailRefs.current[venueRequest.id] = el;
                    }}
                    className="bg-[#F9FCFF] px-6 py-4 border-t border-[#E0D4CB] overflow-hidden"
                  >
                    <div className="text-sm text-[#304B84] space-y-2">
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

export default ShowVenueRequest;
