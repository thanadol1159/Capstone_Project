"use client";

import { useEffect, useState, useRef } from "react";
import { apiJson } from "@/hook/api";
import { apiFormData } from "@/hook/api";
import { VenueRequest } from "@/types/venuerequest";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ApproveVenue = () => {
  const [venues, setVenues] = useState<VenueRequest[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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
    if (expanded === id) {
      // Collapse animation
      const content = document.getElementById(`content-${id}`);
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power1.inOut",
        onComplete: () => setExpanded(null),
      });
    } else {
      setExpanded(id);
    }
  };

  useEffect(() => {
    if (expanded !== null) {
      const content = document.getElementById(`content-${expanded}`);
      if (content) {
        gsap.fromTo(
          content,
          { height: 0, opacity: 0 },
          {
            height: "auto",
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
          }
        );
      }
    }
  }, [expanded]);

  const openImageModal = (
    images: { id: number; image: string }[],
    index: number = 0
  ) => {
    setReviewImages(images.map((img) => img.image));
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 3: // Approved
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 2: // Pending
        return <Clock className="text-yellow-500" size={20} />;
      case 1: // Rejected
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 3: // Approved
        return "bg-green-100 text-green-800";
      case 2: // Pending
        return "bg-yellow-100 text-yellow-800";
      case 1: // Rejected
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      toggleExpand(venueId);
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
      toggleExpand(venueId);
    } catch (error) {
      console.error("Error rejecting venue:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mb-6 text-gray-800"
      >
        Approve Venue Requests
      </motion.h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {venues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-8 text-center"
          >
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Venue Requests Found
            </h3>
            <p className="text-gray-500">
              There are no venue requests pending approval.
            </p>
          </motion.div>
        ) : (
          <div className="divide-y divide-gray-200">
            {venues.map((venue, index) => (
              <div
                key={venue.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="p-5 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${getStatusColor(
                        venue.status
                      )}`}
                    >
                      {getStatusIcon(venue.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {venue.venue_name}
                      </h3>
                      <p className="text-sm text-gray-500">{venue.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        venue.status
                      )}`}
                    >
                      {venue.status === 3
                        ? "Approved"
                        : venue.status === 2
                        ? "Pending"
                        : venue.status === 1
                        ? "Rejected"
                        : "Unknown"}
                    </span>

                    {venue.status === 2 && (
                      <button
                        onClick={() => toggleExpand(venue.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {expanded === venue.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div
                  id={`content-${venue.id}`}
                  className="overflow-hidden"
                  style={{ height: 0, opacity: 0 }}
                >
                  <div className="mt-4 pt-4 border-t border-gray-200 text-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="text-gray-500 w-32">Rooms:</span>
                          <span className="font-medium">
                            {venue.number_of_rooms}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-32">Info:</span>
                          <span className="font-medium">
                            {venue.additional_information}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Venue Images */}
                    {venue.venueRequest_images &&
                      venue.venueRequest_images.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Venue Images
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {venue.venueRequest_images.map((img, index) => (
                              <motion.img
                                key={img.id}
                                src={img.image}
                                alt={`Venue image ${index + 1}`}
                                className="w-24 h-24 object-cover rounded cursor-pointer"
                                onClick={() =>
                                  openImageModal(
                                    venue.venueRequest_images,
                                    index
                                  )
                                }
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Documents
                      </h4>
                      <div className="flex gap-3">
                        <motion.a
                          href={venue.personal_identification}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View ID
                        </motion.a>
                        <motion.a
                          href={venue.venue_certification}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Certification
                        </motion.a>
                      </div>
                    </div>

                    {venue.status === 2 && (
                      <div className="flex justify-end mt-4 gap-2">
                        <motion.button
                          className="px-4 py-2 border rounded text-gray-700 border-[#3F6B96]"
                          onClick={() =>
                            rejectVenue(
                              venue.venue,
                              venue.id,
                              venue.venue_owner
                            )
                          }
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Deny
                        </motion.button>
                        <motion.button
                          className="px-4 py-2 bg-[#3F6B96] text-white rounded"
                          onClick={() =>
                            approveVenue(
                              venue.venue,
                              venue.id,
                              venue.venue_owner
                            )
                          }
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Approve
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <Dialog.Root open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl relative"
            >
              <Dialog.Title className="sr-only">Review Images</Dialog.Title>
              <Dialog.Close asChild>
                <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
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
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default ApproveVenue;
