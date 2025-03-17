import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiJson } from "@/hook/api";

interface ReviewProps {
  date: string;
  rating: number;
  review: string;
  user: number;
  checkIn: string;
  checkOut: string;
  reviewImages: { id: number; image: string }[];
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
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
}) => {
  const [userName, setUserName] = useState<string | null>(null);

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
            <div>
              <p className="text-gray-300">
                {formatDate(checkIn)} - {formatDate(checkOut)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[#304B84]">{review}</p>
          </div>

          {/* Display Review Images */}
          {reviewImages.length > 0 && (
            <div className="flex gap-2 mt-2">
              {reviewImages.map((image) => {
                console.log(image); // Log the image object to inspect its structure
                return (
                  <img
                    key={image.id}
                    src={image.image} // Ensure this is the correct URL string
                    alt={`Review Image ${image.id}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <span className="text-gray-500 ml-4 shrink-0">{formatDate(date)}</span>
    </div>
  );
};

export default Review;
