"use client";
import useFetchVenues from "@/hook/Venue";
import VenueCard from "@/components/ui/Venuecards";
import { useRouter } from 'next/navigation';

export default function VenueRental() {
  const router = useRouter();
  const { venues } = useFetchVenues();
  const categories = ["All", "Meeting", "Film Studio", "Party"];

  const handleDetailClick = (id: string) => {
    router.push(`/venue/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Category Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Category</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full ${
                  category === "All"
                    ? "bg-[#B69B8E] text-black font-bold"
                    : "bg-gray-200 text-black font-bold"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 rounded-full border text-black"
            />
          </div>
        </div>
      </div>

      {/* Venue Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {venues.map((venue: any) => (
          <VenueCard
            key={venue.id}
            {...venue}
            onDetailClick={handleDetailClick}
          />
        ))}
      </div>
    </div>
  );
}
