import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiJson } from "@/hook/api";
// import Modal from "react-modal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  return (
    <div className="bg-white shadow-md rounded-r-xl rounded-l-full p-5 border-[#335473] border flex justify-between">
      <div className="flex gap-5">
        <div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{userName}</span>
              <div className="flex space-x-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    fill={i < rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-300">
              {formatDate(checkIn)} - {formatDate(checkOut)}
            </p>
          </div>

          <p className="text-[#304B84]">{review}</p>

          {/* Display Review Images */}
          {reviewImages.length > 0 && (
            <div className="flex gap-2 mt-2">
              {reviewImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Review ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300 cursor-pointer"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setModalIsOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <span className="text-gray-500 ml-4 shrink-0">{formatDate(date)}</span>
    </div>
  );
};

export default Review;
