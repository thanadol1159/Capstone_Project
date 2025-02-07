"use client";
import { useState, useEffect } from "react";
import useFetchVenues from "@/hook/Venue";
import VenueCard from "@/components/ui/Venuecards";
import { useRouter } from "next/navigation";
import { apiJson } from "@/hook/api";

export default function VenueRental() {
  const router = useRouter();
  const { venues } = useFetchVenues();
  const categories = ["All", "Meeting", "Studio", "Party"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const handleDetailClick = (id: string) => {
    router.push(`/venue/${id}`);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    console.log(selectedCategory);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filter venues based on the selected category and search query
  const filteredVenues = venues.filter((venue: any) => {
    const matchesCategory =
      selectedCategory === "All" || venue.category_event === selectedCategory;
    const matchesSearch = venue.venue_name.toLowerCase().includes(searchQuery);
    const matchesStatus = venue.status === 3; // Ensure only venues with status 3 are shown

    return matchesCategory && matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Category Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Category</h2>
        <div className="flex items-center gap-4 justify-between">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-12 py-1 rounded-lg ${
                  category === selectedCategory
                    ? "bg-[#335473] text-white font-semibold"
                    : "bg-[#BCCFE1] text-[#7397BB] font-semibold"
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
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 rounded-full border text-black"
            />
          </div>
        </div>
      </div>

      {/* Venue Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue: any) => (
            <VenueCard
              key={venue.id}
              {...venue}
              onDetailClick={handleDetailClick}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-black text-[20px]">
            No venues found.
          </p>
        )}
      </div>
    </div>
  );
}
