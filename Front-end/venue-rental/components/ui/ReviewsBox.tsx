import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiJson } from "@/hook/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewProps {
  date: string;
  rating: number;
  review: string;
  user: number;
  checkIn: string;
  checkOut: string;
  reviewImages: string[];
  clean: number;
  service: number;
  valueForMoney: number;
  matchesExpectations: number;
  facilities: number;
  environment: number;
  location: number;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Review: React.FC<ReviewProps> = ({
  date,
  rating,
  review,
  user,
  checkIn,
  checkOut,
  reviewImages,
  clean,
  service,
  valueForMoney,
  matchesExpectations,
  facilities,
  environment,
  location,
}) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await apiJson.get(`/users/${user}/`);
        setUserName(response.data.username);
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setUserName("Unknown User");
      }
    };

    fetchUserName();
  }, [user]);

  // Calculate the average rating
  const averageRating =
    (clean +
      service +
      valueForMoney +
      matchesExpectations +
      facilities +
      environment +
      location) /
    7;

  return (
    <div className="bg-white shadow-md rounded-3xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-[#335473] border flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex gap-3 sm:gap-5">
        <div className="shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
              <span className="font-medium text-sm sm:text-base">
                {userName}
              </span>
              <div className="flex space-x-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill={
                      i < Math.round(averageRating) ? "currentColor" : "none"
                    }
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              {formatDate(checkIn)} - {formatDate(checkOut)}
            </p>
          </div>

          <p className="text-[#304B84] text-sm sm:text-base">{review}</p>

          {/* Display Review Images */}
          {reviewImages.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {reviewImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Review ${index + 1}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-300 cursor-pointer"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setIsOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <span className="text-gray-500 text-xs sm:text-sm sm:ml-4 sm:shrink-0 self-end sm:self-auto">
        {formatDate(date)}
      </span>

      {/* Radix UI Modal */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl relative"
            >
              <Dialog.Title className="sr-only">Review Images</Dialog.Title>
              <Dialog.Close asChild>
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500">
                  <X className="w-5 h-5" />
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
                      className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-contain rounded-lg"
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

export default Review;
