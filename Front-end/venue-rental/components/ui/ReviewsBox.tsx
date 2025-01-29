import React from "react";
import { Star } from "lucide-react";

interface ReviewProps {
  date: string;
  rating: number;
  review: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Review: React.FC<ReviewProps> = ({ date, rating, review }) => {
  return (
    <div className="bg-white shadow-md rounded-r-xl rounded-l-full p-5 space-y-2 border-[#335473] border">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex space-x-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5"
                fill={i < rating ? "currentColor" : "none"}
              />
            ))}
          </div>
          {/* <span className="font-medium">{name}</span> */}
        </div>
        <span className="text-gray-500">{formatDate(date)}</span>
      </div>

      <p className="text-[#304B84]">{review}</p>
    </div>
  );
};

export default Review;
