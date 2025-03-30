"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/hook/api";
import { apiFormData } from "@/hook/api";
import { VenueRequest } from "@/types/venuerequest";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ApproveVenue = () => {
  const [venues, setVenues] = useState<VenueRequest[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewImages, setReviewImages] = useState<string[]>([]);

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

  const openImageModal = (
    images: { id: number; image: string }[],
    index: number = 0
  ) => {
    setReviewImages(images.map((img) => img.image));
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const sendNotification = async (userId: number) => {
    try {
      await apiJson.post("/notifications/", {
        notifications_type: "Admin approve",
        create_at: new Date().toISOString(),
        message: "Admin has approved your venue!",
        user: userId,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const sendNotificationRejected = async (userId: number) => {
    try {
      await apiJson.post("/notifications/", {
        notifications_type: "Admin Rejected",
        create_at: new Date().toISOString(),
        message: "Admin has Rejected your venue!",
        user: userId,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const approveVenue = async (
    venueId: number,
    requestId: number,
    venueOwner: number
  ) => {
    try {
      await apiFormData.patch(`/venues/${venueId}/`, { status: 3 });
      await apiFormData.patch(`/venue-requests/${requestId}/`, { status: 3 });

      setVenues((prevVenues) =>
        prevVenues.map((venue) =>
          venue.id === requestId ? { ...venue, status: 3 } : venue
        )
      );
      setExpanded(null);

      sendNotification(venueOwner);
    } catch (error) {
      console.error("Error approving venue:", error);
    }
  };

  const rejectVenue = async (
    venueId: number,
    requestId: number,
    venueOwner: number
  ) => {
    try {
      await apiFormData.patch(`/venues/${venueId}/`, { status: 1 });
      await apiFormData.patch(`/venue-requests/${requestId}/`, { status: 1 });

      setVenues((prevVenues) =>
        prevVenues.map((venue) =>
          venue.id === requestId ? { ...venue, status: 1 } : venue
        )
      );
      setExpanded(null);

      sendNotificationRejected(venueOwner);
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

                {/* Venue Images */}
                {venue.venueRequest_images &&
                  venue.venueRequest_images.length > 0 && (
                    <>
                      <p>
                        <strong>Venue Images:</strong>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {venue.venueRequest_images.map((img, index) => (
                          <img
                            key={img.id}
                            src={img.image}
                            alt={`Venue image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded cursor-pointer"
                            onClick={() =>
                              openImageModal(venue.venueRequest_images, index)
                            }
                          />
                        ))}
                      </div>
                    </>
                  )}

                <p>
                  <strong>Documents:</strong>
                </p>
                <div className="flex gap-3 mt-2">
                  <a
                    href={venue.personal_identification}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    View ID
                  </a>
                  <a
                    href={venue.venue_certification}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    View Certification
                  </a>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    className="px-4 py-2 border rounded text-gray-700 mr-2 border-[#3F6B96]"
                    onClick={() =>
                      rejectVenue(venue.venue, venue.id, venue.venue_owner)
                    }
                  >
                    Deny
                  </button>
                  <button
                    className="px-4 py-2 bg-[#3F6B96] text-white rounded"
                    onClick={() =>
                      approveVenue(venue.venue, venue.id, venue.venue_owner)
                    }
                  >
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Viewer Modal */}
      <Dialog.Root open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl relative">
              <Dialog.Title className="sr-only">Review Images</Dialog.Title>
              <Dialog.Close asChild>
                <button className="absolute top-3 right-3 text-gray-500">
                  <X />
                </button>
              </Dialog.Close>

              {/* Swiper Carousel */}
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                initialSlide={selectedImageIndex}
                className="w-full"
              >
                {reviewImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={img}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-[400px] object-contain rounded-lg"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default ApproveVenue;
